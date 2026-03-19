import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';

export const useSearchServices = (query: string, categorySlug: string | null) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); // Signal loading immediately
    setError(null);

    const fetchServices = async () => {

      try {
        let supabaseQuery = supabase
          .from('services')
          .select('*, service_categories!inner(categories!inner(slug))');

        if (query) {
          supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
        }

        if (categorySlug && categorySlug !== 'all') {
          supabaseQuery = supabaseQuery.eq('service_categories.categories.slug', categorySlug);
        }

        const { data, error: searchError } = await supabaseQuery.order('name');

        if (searchError) throw searchError;
        
        const mappedData = (data || []).map(s => ({
          ...s,
          price: s.base_price || 0,
          category: s.service_type || 'Experience'
        }));
        
        setServices(mappedData);
      } catch (err: any) {
        console.error('Error searching services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchServices();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [query, categorySlug]);

  return { services, loading, error };
};
