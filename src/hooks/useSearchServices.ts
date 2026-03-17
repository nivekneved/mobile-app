import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';

export const useSearchServices = (query: string, categorySlug: string | null) => {
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
          .select('*');

        if (query) {
          supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
        }

        if (categorySlug && categorySlug !== 'all') {
          // Mapping "hotels" -> "hotel", "activities" -> "activity"
          let type = categorySlug;
          if (type === 'hotels') type = 'hotel';
          if (type === 'activities') type = 'activity';
          if (type === 'cruises') type = 'cruise';
          
          supabaseQuery = supabaseQuery.eq('service_type', type);
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
