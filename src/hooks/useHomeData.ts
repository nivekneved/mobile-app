import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateLeadPrice } from '../utils/pricingUtils';

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  media_type: string;
  cta_text?: string;
  cta_link?: string;
  badge_text?: string;
  badge_color?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  link: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-hotels', name: 'Hotels & Resorts', slug: 'hotels', image_url: 'assets/categories/hotels.jpg', link: '/explore?category=hotels' },
  { id: 'cat-sea', name: 'Sea Activities', slug: 'activities-sea', image_url: 'assets/categories/cruises.jpg', link: '/explore?category=activities-sea' },
  { id: 'cat-land', name: 'Land Activities', slug: 'activities-land', image_url: 'assets/categories/activities.jpg', link: '/explore?category=activities-land' },
  { id: 'cat-flights', name: 'Flights', slug: 'flights', image_url: 'assets/categories/flights.jpg', link: '/flights' },
  { id: 'cat-villas', name: 'Villas & Private Stays', slug: 'villas', image_url: 'assets/categories/villas.jpg', link: '/explore?category=villas' },
];

export type Service = {
  id: string;
  name: string;
  description: string;
  lowestPrice: number;
  price: number;      // mapped for UI
  strikethrough_price?: number;
  image_url: string;
  service_type: string; // Actual column name
  category: string;     // mapped for UI
  location?: string;
  amenities?: string[];
  itinerary?: { day?: string; time?: string; title: string; description: string }[];
  gallery_images?: string[];
  room_types?: any[]; // JSON column
  max_group_size?: number;
  max_adults?: number;
  cancellation_policy?: string;
  terms_and_conditions?: string;
  included?: string[] | string;
  not_included?: string[] | string;
  special_features?: string[] | string;
  highlights?: string[] | string;
  duration_days?: number;
  duration_hours?: number;
  banner_url?: string;
  rating?: number;
  meal_plans?: string[];
  secondary_image_url?: string;
  activity_type?: string;
  is_seasonal?: boolean;
  deal_note?: string;
  short_description?: string;
};
/* PREVIOUS PROPERTIES PRESERVED AS COMMENT PER USER RULES:
  rating?: number;
  meal_plans?: string[];
  secondary_image_url?: string;
};
*/

export const useHomeData = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<{name: string, image: any, query: string}[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // PRESERVED ORIGINAL BLOCK COMMENTED OUT:
        /*
        const [
          { data: slides, error: slidesError },
          { data: cats, error: catsError },
          { data: services, error: servicesError },
          { data: regionData, error: regionError }
        ] = await Promise.all([
          supabase.from('hero_slides').select('*').order('order_index', { ascending: true }),
          supabase.from('categories').select('*').order('display_order', { ascending: true, nullsFirst: false }),
          supabase.from('services').select('*, service_pricing(price, occupancy_pricing), service_categories(categories(name))').order('priority', { ascending: false }).order('created_at', { ascending: false }).limit(10),
          supabase.from('services').select('region').not('region', 'is', null)
        ]);
        
        if (slidesError) {
          console.error('Supabase error (hero_slides):', slidesError);
          throw slidesError;
        }
        if (catsError) {
          console.error('Supabase error (categories):', catsError);
          throw catsError;
        }
        if (servicesError) {
          console.error('Supabase error (services):', servicesError);
          throw servicesError;
        }

        const mappedServices = (services || []).map((s: any) => {
          const categoryName = s.service_categories?.[0]?.categories?.name || s.service_type || 'Experience';
          const lowestPrice = calculateLeadPrice(s.service_pricing || [], s.service_type);
          return { ...s, price: lowestPrice, lowestPrice, category: categoryName };
        });
        */

        // OPTIMIZED SPLIT QUERY:
        const [
          { data: slides, error: slidesError },
          { data: cats, error: catsError },
          { data: servicesRaw, error: servicesError },
          { data: regionData, error: regionError }
        ] = await Promise.all([
          supabase.from('hero_slides').select('*').order('order_index', { ascending: true }),
          supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true, nullsFirst: false }),
          supabase.from('services').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false }).limit(10),
          supabase.from('services').select('region').not('region', 'is', null)
        ]);

        let mappedServices: any[] = [];
        if (servicesRaw && servicesRaw.length > 0) {
          const serviceIds = servicesRaw.map((s: any) => s.id);
          const today = new Date().toISOString().split('T')[0];
          const [
            { data: pricing, error: pricingError },
            { data: categoriesRel, error: catError }
          ] = await Promise.all([
            // PRESERVED: supabase.from('service_pricing').select('service_id, price, occupancy_pricing').in('service_id', serviceIds),
            supabase.from('service_pricing')
              .select('service_id, price, occupancy_pricing, date_from, date_to')
              .in('service_id', serviceIds)
              .or(`date_to.gte.${today},date_to.is.null`)
              .limit(10000),
            supabase.from('service_categories').select('service_id, categories(name)').in('service_id', serviceIds)
          ]);

          if (pricingError) console.error('Supabase error (service_pricing):', pricingError);
          if (catError) console.error('Supabase error (service_categories):', catError);

          mappedServices = servicesRaw.map((s: any) => {
            const sPricing = pricing ? pricing.filter((p: any) => p.service_id === s.id) : [];
            const sCats = categoriesRel ? categoriesRel.filter((c: any) => c.service_id === s.id) : [];
            const categoryObj = sCats?.[0]?.categories as any;
            const categoryName = (Array.isArray(categoryObj) ? categoryObj[0]?.name : categoryObj?.name) || s.service_type || 'Experience';
            // PRESERVED: const lowestPrice = calculateLeadPrice(sPricing, s.service_type);
            const lowestPrice = calculateLeadPrice(sPricing, s.service_type, s.price);
            return { ...s, price: lowestPrice, lowestPrice, category: categoryName };
          });
        }

        if (slidesError) {
          console.error('Supabase error (hero_slides):', slidesError);
        } else {
          setHeroSlides(slides || []);
        }

        if (catsError || !cats || cats.length === 0) {
          if (catsError) console.error('Supabase error (categories):', catsError);
          setCategories(DEFAULT_CATEGORIES);
        } else {
          const visibleCats = cats.filter((c: any) => c.show_on_home !== false);
          setCategories(visibleCats.length > 0 ? visibleCats : DEFAULT_CATEGORIES);
        }

        if (servicesError) {
          console.error('Supabase error (services):', servicesError);
        } else {
          setFeaturedServices(mappedServices);
        }

        if (!regionError && regionData) {
          const uniqueRegions = [...new Set((regionData as {region: string}[]).map(r => r.region))];
          const mappedDestinations = uniqueRegions.slice(0, 5).map(region => ({
            name: region.toUpperCase(),
            query: region,
            // Use local app icon as fallback — api.placeholder.com is an invalid/dead URL
            image: require('../../assets/icon.png')
          }));
          setDestinations(mappedDestinations);
        }
      } catch (err: any) {
        console.error('Home Data Error:', err.message || err);
        setError(err.message || 'An error occurred while loading home data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { heroSlides, categories, destinations, featuredServices, isLoading, error };
};
