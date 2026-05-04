import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';
import { calculateLeadPrice } from '../utils/pricingUtils';

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
          .select('*, amenities, itinerary, gallery_images, service_pricing(price, occupancy_pricing), service_categories(categories(name))')
          .eq('id', id)
          .single();

        if (serviceError) throw serviceError;
        
        if (data) {
          // Extract category name from the join if available
          const categoryName = data.service_categories?.[0]?.categories?.name || data.service_type || 'Experience';
          const lowestPrice = calculateLeadPrice(data.service_pricing || [], data.service_type);

          setService({
            ...data,
            price: lowestPrice,
            lowestPrice: lowestPrice,
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
