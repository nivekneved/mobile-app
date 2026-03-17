import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';

export const useSearchServices = (query: string, categoryId: string | null) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        let supabaseQuery = supabase
          .from('services')
          .select('*')
          .eq('is_active', true);

        if (query) {
          supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
        }

        if (categoryId && categoryId !== 'all') {
          supabaseQuery = supabaseQuery.eq('category_id', categoryId);
        }

        const { data, error: searchError } = await supabaseQuery.order('name');

        if (searchError) throw searchError;
        setServices(data || []);
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
  }, [query, categoryId]);

  return { services, loading, error };
};
