import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';

export const useSearchServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchServices = useCallback(async (query: string, categorySlug: string | null = null) => {
    setIsLoading(true);
    setError(null);
    try {
      let supabaseQuery = supabase
        .from('services')
        .select('*, service_categories!inner(categories!inner(id, name, slug))')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (query) {
        supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
      }

      // Filter by category slug via the join table
      if (categorySlug && categorySlug !== 'all') {
        supabaseQuery = supabaseQuery.eq('service_categories.categories.slug', categorySlug);
      }

      const { data, error: searchError } = await supabaseQuery;

      if (searchError) throw searchError;

      const mappedServices = (data || []).map((s: any) => {
        // Extract category name from the join if available
        const categoryName = s.service_categories?.[0]?.categories?.name || s.service_type || 'Experience';
        
        return {
          ...s,
          price: s.base_price || 0,
          category: categoryName
        };
      });

      setServices(mappedServices);
    } catch (err: any) {
      console.error('Search Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { services, isLoading, error, searchServices };
};
