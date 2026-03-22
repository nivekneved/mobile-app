import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';

export const useServiceDetails = (id: string | string[] | undefined) => {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchService = async () => {
      try {
        setIsLoading(true);
        const { data, error: serviceError } = await supabase
          .from('services')
          .select('*, amenities, itinerary, service_categories(categories(name))')
          .eq('id', id)
          .single();

        if (serviceError) throw serviceError;
        
        if (data) {
          // Extract category name from the join if available
          const categoryName = data.service_categories?.[0]?.categories?.name || data.service_type || 'Experience';

          setService({
            ...data,
            price: data.base_price || 0,
            category: categoryName
          });
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  return { service, isLoading, error };
};
