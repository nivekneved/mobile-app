import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';

export const useServiceDetails = (id: string | string[] | undefined) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        const { data, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (serviceError) throw serviceError;
        
        if (data) {
          setService({
            ...data,
            price: data.base_price || 0,
            category: data.service_type || 'Experience'
          });
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  return { service, loading, error };
};
