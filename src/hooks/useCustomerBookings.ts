import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export type Booking = {
  id: string;
  service_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  services: {
    name: string;
    image_url: string;
    location: string;
    base_price: number; // Actual column name is base_price, not price
    category: string;
  };
};

export const useCustomerBookings = () => {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        // We fetch from the 'bookings' table and join with 'services'
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            service_id,
            user_id,
            status,
            created_at,
            services (
              name,
              image_url,
              location,
              base_price,
              category
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(data as any || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [session?.user]);

  return { bookings, isLoading, error };
};
