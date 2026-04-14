import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ServicePricingRequest {
  serviceId: string;
  variantId?: string; // Room Type UUID or 'default'
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  participants: {
    adults: number;
    teens: number;
    children: number;
    infants: number;
  };
  baseRates: {
    adult: number;
    teen: number;
    child: number;
    infant: number;
  };
}

export interface DailyRate {
  date: string;
  adult: number;
  teen: number;
  child: number;
  infant: number;
  source: 'grid' | 'base';
}

export interface CalculatedPricing {
  dailyRates: DailyRate[];
  total: number;
  totalPerCategory: {
    adults: number;
    teens: number;
    children: number;
    infants: number;
  };
  nights: number;
}

export const useServicePricing = (req: ServicePricingRequest | null) => {
  const [pricing, setPricing] = useState<CalculatedPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!req || !req.serviceId || !req.startDate || !req.endDate) {
      setPricing(null);
      return;
    }

    const calculate = async () => {
      setLoading(true);
      try {
        const { serviceId, variantId, startDate, endDate, participants, baseRates } = req;
        
        const query = supabase
          .from('service_pricing')
          .select('*')
          .eq('service_id', serviceId);

        if (!variantId || variantId === 'default') {
          query.is('variant_id', null);
        } else {
          query.eq('variant_id', variantId);
        }

        const { data: overrides, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dailyRates: DailyRate[] = [];
        
        let totalAdults = 0;
        let totalTeens = 0;
        let totalChildren = 0;
        let totalInfants = 0;

        const loopEnd = startDate === endDate ? new Date(new Date(endDate).getTime() + 86400000) : end;
        const nights = Math.max(1, Math.ceil((loopEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        for (let d = new Date(start); d < loopEnd; d.setDate(d.getDate() + 1)) {
          const currentDateStr = d.toISOString().split('T')[0];
          
          const activePricing = overrides?.find(o => 
            (o.date_from === currentDateStr && o.date_to === currentDateStr) ||
            (o.date_from <= currentDateStr && o.date_to >= currentDateStr)
          );

          const rates: DailyRate = {
            date: currentDateStr,
            adult: activePricing ? Number(activePricing.price) : baseRates.adult,
            teen: activePricing ? Number(activePricing.price_teen) : baseRates.teen,
            child: activePricing ? Number(activePricing.price_child) : baseRates.child,
            infant: activePricing ? Number(activePricing.price_infant) : baseRates.infant,
            source: activePricing ? 'grid' : 'base',
          };

          dailyRates.push(rates);
          
          totalAdults += rates.adult * (participants.adults || 0);
          totalTeens += rates.teen * (participants.teens || 0);
          totalChildren += rates.child * (participants.children || 0);
          totalInfants += rates.infant * (participants.infants || 0);
        }

        setPricing({
          dailyRates,
          total: totalAdults + totalTeens + totalChildren + totalInfants,
          totalPerCategory: {
            adults: totalAdults,
            teens: totalTeens,
            children: totalChildren,
            infants: totalInfants,
          },
          nights
        });
      } catch (err: any) {
        console.error('Pricing calculation error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [JSON.stringify(req)]);

  return { pricing, loading, error };
};
