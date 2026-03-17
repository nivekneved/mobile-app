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
    price: number;
    category: string;
  };
};

export const useCustomerBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
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
              price,
              category
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(data as any || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  return { bookings, loading, error };
};
