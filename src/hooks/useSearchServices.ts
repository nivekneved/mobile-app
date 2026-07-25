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

      let dbCategorySlug = categorySlug;
      let activityTypeFilter: string | null = null;

      if (categorySlug === 'activities-land') {
        dbCategorySlug = 'activities';
        activityTypeFilter = 'Land';
      } else if (categorySlug === 'activities-sea') {
        dbCategorySlug = 'activities';
        activityTypeFilter = 'Sea';
      }

      let selectString = '*, service_categories(categories(id, name, slug))';

      if (dbCategorySlug && dbCategorySlug !== 'all') {
        selectString = '*, service_categories!inner(categories!inner(id, name, slug))';
      }

      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;

      let supabaseQuery = supabase
        .from('services')
        .select(selectString)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%,region.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (region && region !== 'All') {
        supabaseQuery = supabaseQuery.ilike('location', `%${region}%`);
      }

      if (dbCategorySlug && dbCategorySlug !== 'all') {
        supabaseQuery = supabaseQuery.eq('service_categories.categories.slug', dbCategorySlug);
      }

      if (activityTypeFilter) {
        supabaseQuery = supabaseQuery.eq('activity_type', activityTypeFilter);
      }

      const { data: servicesRaw, error: searchError } = await supabaseQuery;

      if (searchError) throw searchError;

      let mappedServices: any[] = [];
      const today = new Date().toISOString().split('T')[0];

      if (servicesRaw && servicesRaw.length > 0) {
        const serviceIds = servicesRaw.map((s: any) => s.id);
        const { data: pricingData, error: pricingError } = await supabase
          .from('service_pricing')
          .select('service_id, price, occupancy_pricing, date_from, date_to')
          .in('service_id', serviceIds)
          .lte('date_from', today)
          .gte('date_to', today)
          .limit(10000);

        if (pricingError) console.error('Supabase error (service_pricing search):', pricingError);

        mappedServices = servicesRaw.map((s: any) => {
          const categoryName = s.service_categories?.[0]?.categories?.name || s.service_type || 'Experience';
          const sPricing = pricingData ? pricingData.filter((p: any) => p.service_id === s.id) : [];
          const lowestPrice = calculateLeadPrice(sPricing, s.service_type, s.price);

          return {
            ...s,
            price: lowestPrice,
            lowestPrice: lowestPrice,
            category: categoryName,
          };
        });
      }

      setHasMore(servicesRaw ? servicesRaw.length === pageSize : false);

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

