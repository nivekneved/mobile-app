import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from './useHomeData';
import { calculateLeadPrice } from '../utils/pricingUtils';

export const useServiceDetails = (id: string | string[] | undefined) => {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetId = Array.isArray(id) ? id[0] : id;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    const fetchService = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const [serviceRes, pricingRes, roomsRes] = await Promise.all([
          supabase
            .from('services')
            .select('*, service_categories(categories(name, slug))')
            .eq('id', targetId)
            .single(),
          supabase
            .from('service_pricing')
            .select('service_id, variant_id, price, price_teen, price_child, price_infant, occupancy_pricing, is_stop_sell')
            .eq('service_id', targetId)
            .lte('date_from', today)
            .gte('date_to', today)
            .limit(1000),
          supabase
            .from('room_types')
            .select('id, service_id, price, weekday_price, weekend_price, prices')
            .eq('service_id', targetId),
        ]);

        if (serviceRes.error) throw serviceRes.error;
        const data = serviceRes.data;

        if (data) {
          const categoryName = data.service_categories?.[0]?.categories?.name || data.service_type || 'Experience';
          const pricing = (pricingRes.data || []).filter((p: any) => !p.is_stop_sell);
          const allRooms = [...(Array.isArray(data.room_types) ? data.room_types : []), ...(roomsRes.data || [])];
          const lowestPrice = calculateLeadPrice(pricing, data.service_type, data.price, allRooms);
          const primaryPricing = pricing.find((p: any) => !p.variant_id) || pricing[0];

          setService({
            ...data,
            price: lowestPrice,
            lowestPrice: lowestPrice,
            price_teen: primaryPricing?.price_teen || data.price_teen,
            price_child: primaryPricing?.price_child || data.price_child,
            price_infant: primaryPricing?.price_infant || data.price_infant,
            category: categoryName,
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
