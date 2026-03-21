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
        .select('*');

      if (query) {
        supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
      }

      // If categorySlug is provided, we filter by category
      // Note: In your DB, services might have a service_type or similar mapping
      if (categorySlug && categorySlug !== 'all') {
        supabaseQuery = supabaseQuery.eq('service_type', categorySlug);
      }

      const { data, error: searchError } = await supabaseQuery;

      if (searchError) throw searchError;

      const mappedServices = (data || []).map((s: any) => ({
        ...s,
        price: s.base_price || 0,
        category: s.service_type || 'Experience'
      }));

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
