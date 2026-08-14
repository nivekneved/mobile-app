import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';
import { calculateLeadPrice } from '../utils/pricingUtils';

export const useSearchServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSearchArgs = useRef<{ query: string; categorySlug: string | null; region: string | null }>({ query: '', categorySlug: null, region: null });

  const fetchServiceBatch = async (
    query: string, 
    categorySlug: string | null, 
    region: string | null, 
    pageIndex: number, 
    pageSize: number = 15,
    append: boolean = false
  ) => {
    try {
      if (pageIndex === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      // Category & Alias Resolution helper
      const resolveCategoryMatches = (slug: string | null) => {
        if (!slug || slug === 'all') return null;
        const s = slug.toLowerCase().trim();
        if (['hotels', 'hotel', 'resorts', 'resort', 'stay', 'stays', 'accommodation'].includes(s)) {
          return { 
            slugs: ['hotels', 'hotel', 'resorts', 'resort', 'stay', 'stays', 'accommodation', 'villas', 'villa'], 
            types: ['hotel', 'hotels', 'stay', 'stays', 'resort', 'resorts', 'accommodation', 'villa'], 
            activityType: null 
          };
        }
        if (['cruises', 'cruise'].includes(s)) {
          return { 
            slugs: ['cruises', 'cruise'], 
            types: ['cruise', 'sea_activity'], 
            activityType: null 
          };
        }
        if (['tours', 'tour', 'guided-group-tours'].includes(s)) {
          return { 
            slugs: ['tours', 'tour', 'guided-group-tours'], 
            types: ['tour', 'package_tour', 'land_activity'], 
            activityType: null 
          };
        }
        if (['packages', 'package', 'travel-packages'].includes(s)) {
          return { 
            slugs: ['packages', 'package', 'travel-packages'], 
            types: ['package', 'travel_package', 'day_package'], 
            activityType: null 
          };
        }
        if (['day-packages', 'hotel-day-packages', 'day-package'].includes(s)) {
          return { 
            slugs: ['day-packages', 'hotel-day-packages', 'day-package'], 
            types: ['day_package', 'hotel_day_package', 'package'], 
            activityType: null 
          };
        }
        if (['villas', 'villa'].includes(s)) {
          return { 
            slugs: ['villas', 'villa', 'hotels', 'hotel'], 
            types: ['villa', 'hotel', 'stay', 'stays'], 
            activityType: null 
          };
        }
        if (['activities-sea', 'sea-activities'].includes(s)) {
          return { 
            slugs: ['activities-sea', 'sea-activities', 'activities', 'cruises'], 
            types: ['activity', 'sea_activity', 'cruise'], 
            activityType: 'Sea' 
          };
        }
        if (['activities-land', 'land-activities'].includes(s)) {
          return { 
            slugs: ['activities-land', 'land-activities', 'activities', 'tours'], 
            types: ['activity', 'land_activity', 'tour'], 
            activityType: 'Land' 
          };
        }
        if (['activities', 'activity'].includes(s)) {
          return { 
            slugs: ['activities', 'activity', 'sea-activities', 'land-activities', 'cruises', 'tours'], 
            types: ['activity', 'sea_activity', 'land_activity', 'cruise', 'tour'], 
            activityType: null 
          };
        }
        return { slugs: [s], types: [s], activityType: null };
      };

      const catFilter = resolveCategoryMatches(categorySlug);
      const selectString = '*, service_categories(categories(id, name, slug))';

      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;

      let supabaseQuery = supabase
        .from('services')
        .select(selectString)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%,region.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (region && region !== 'All') {
        supabaseQuery = supabaseQuery.ilike('location', `%${region}%`);
      }

      const { data: servicesRaw, error: searchError } = await supabaseQuery;

      if (searchError) throw searchError;

      // In-memory Category & Activity Filtering
      let filteredRaw = servicesRaw || [];
      if (catFilter) {
        filteredRaw = filteredRaw.filter((s: any) => {
          const sType = (s.service_type || '').toLowerCase();
          const sActType = (s.activity_type || '').toLowerCase();
          const categories = s.service_categories || [];
          const catSlugs = categories.map((sc: any) => (sc?.categories?.slug || '').toLowerCase());
          const catNames = categories.map((sc: any) => (sc?.categories?.name || '').toLowerCase());

          const matchesCategorySlug = catSlugs.some((cs: string) => catFilter.slugs.some(filterSlug => cs.includes(filterSlug) || filterSlug.includes(cs)));
          const matchesCategoryName = catNames.some((cn: string) => catFilter.slugs.some(filterSlug => cn.includes(filterSlug)));
          const matchesServiceType = catFilter.types.some(t => sType.includes(t) || t.includes(sType));
          const matchesActivityType = catFilter.activityType 
            ? sActType === catFilter.activityType.toLowerCase() 
            : true;

          const isCatMatch = matchesCategorySlug || matchesCategoryName || matchesServiceType;
          return isCatMatch && matchesActivityType;
        });
      }

      // Pagination slice
      const pagedRaw = filteredRaw.slice(from, to + 1);

      let mappedServices: any[] = [];
      const today = new Date().toISOString().split('T')[0];

      if (pagedRaw && pagedRaw.length > 0) {
        const serviceIds = pagedRaw.map((s: any) => s.id);
        const [
          pricingResults,
          roomTypesResults
        ] = await Promise.all([
          Promise.all(serviceIds.map(id => 
            supabase.from('service_pricing').select('service_id, price, occupancy_pricing').eq('service_id', id).limit(10)
          )),
          Promise.all(serviceIds.map(id => 
            supabase.from('room_types').select('service_id, price, weekday_price, weekend_price, prices').eq('service_id', id)
          ))
        ]);

        mappedServices = pagedRaw.map((s: any, idx: number) => {
          const categoryName = s.service_categories?.[0]?.categories?.name || s.service_type || 'Experience';
          const sPricing = pricingResults[idx]?.data || [];
          const sRooms = roomTypesResults[idx]?.data || [];
          const allRooms = [...(Array.isArray(s.room_types) ? s.room_types : []), ...sRooms];
          const lowestPrice = calculateLeadPrice(sPricing, s.service_type, s.price, allRooms);

          return {
            ...s,
            price: lowestPrice,
            lowestPrice: lowestPrice,
            category: categoryName,
          };
        });
      }

      setHasMore(filteredRaw.length > to + 1);

      if (append) {
        setServices(prev => [...prev, ...mappedServices]);
      } else {
        setServices(mappedServices);
      }
    } catch (err: any) {
      console.error('Search Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const searchServices = useCallback((query: string, categorySlug: string | null = null, region: string | null = null) => {
    currentSearchArgs.current = { query, categorySlug, region };
    setPage(0);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchServiceBatch(query, categorySlug, region, 0, 15, false);
    }, 300);
  }, []);

  const loadMoreServices = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    const { query, categorySlug, region } = currentSearchArgs.current;
    fetchServiceBatch(query, categorySlug, region, nextPage, 15, true);
  }, [isLoading, isLoadingMore, hasMore, page]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { services, isLoading, isLoadingMore, hasMore, error, searchServices, loadMoreServices };
};

