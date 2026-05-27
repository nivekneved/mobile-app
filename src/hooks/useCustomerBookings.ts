import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Booking = {
  id: string;
  customer_id: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | string;
  created_at: string;
  service_name: string;
  total_amount: number;
  service_type: string;
  service_id?: string;
  image_url?: string;
  location?: string;
  booking_reference?: string;
};

/* PREVIOUS IMPLEMENTATION PRESERVED AS COMMENT PER USER RULES:
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
        
        // Step 1: Get the customer record for this auth user
        const { data: customer, error: customerErr } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (customerErr && customerErr.code !== 'PGRST116') throw customerErr;
        
        if (!customer) {
            setBookings([]);
            setIsLoading(false);
            return;
        }

        // Step 2: Fetch bookings and join with booking_items -> services for imagery
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            customer_id,
            status,
            created_at,
            service_name,
            total_amount,
            service_type,
            booking_items(
              service_id,
              services(
                image_url,
                location
              )
            )
          `)
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Map the complicated join down to the clean Booking type for the UI
        const mappedBookings: Booking[] = (data || []).map((booking: any) => {
          const firstItem = booking.booking_items?.[0];
          return {
            id: booking.id,
            customer_id: booking.customer_id,
            status: booking.status,
            created_at: booking.created_at,
            service_name: booking.service_name,
            total_amount: booking.total_amount,
            service_type: booking.service_type,
            service_id: firstItem?.service_id || undefined,
            image_url: firstItem?.services?.image_url || undefined,
            location: firstItem?.services?.location || 'Mauritius',
          };
        });

        setBookings(mappedBookings);
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
*/

export const useCustomerBookings = () => {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Collect all customer IDs to fetch (both logged-in user and guest IDs from storage)
      const customerIdsToFetch: string[] = [];

      // 1. Check logged-in user
      if (session?.user) {
        const { data: customer, error: customerErr } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!customerErr && customer) {
          customerIdsToFetch.push(customer.id);
        }
      }

      // 2. Check local guest customer IDs stored on device
      try {
        const guestIdsString = await AsyncStorage.getItem('guest_customer_ids');
        if (guestIdsString) {
          const guestIds: string[] = JSON.parse(guestIdsString);
          if (Array.isArray(guestIds)) {
            guestIds.forEach(id => {
              if (id && !customerIdsToFetch.includes(id)) {
                customerIdsToFetch.push(id);
              }
            });
          }
        }
      } catch (storageErr) {
        console.error('Error reading guest IDs from AsyncStorage:', storageErr);
      }

      if (customerIdsToFetch.length === 0) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      // Fetch bookings for any of the gathered customer IDs
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          status,
          created_at,
          service_name,
          total_amount,
          service_type,
          booking_reference,
          booking_items(
            service_id,
            services(
              image_url,
              location
            )
          )
        `)
        .in('customer_id', customerIdsToFetch)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const mappedBookings: Booking[] = (data || []).map((booking: any) => {
        const firstItem = booking.booking_items?.[0];
        return {
          id: booking.id,
          customer_id: booking.customer_id,
          status: booking.status,
          created_at: booking.created_at,
          service_name: booking.service_name,
          total_amount: booking.total_amount,
          service_type: booking.service_type,
          service_id: firstItem?.service_id || undefined,
          image_url: firstItem?.services?.image_url || undefined,
          location: firstItem?.services?.location || 'Mauritius',
          booking_reference: booking.booking_reference || undefined,
        };
      });

      setBookings(mappedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  const addGuestCustomerId = useCallback(async (id: string) => {
    try {
      const guestIdsString = await AsyncStorage.getItem('guest_customer_ids');
      let guestIds: string[] = [];
      if (guestIdsString) {
        guestIds = JSON.parse(guestIdsString);
      }
      if (!guestIds.includes(id)) {
        guestIds.push(id);
        await AsyncStorage.setItem('guest_customer_ids', JSON.stringify(guestIds));
      }
      // Re-fetch bookings with new customer ID
      await fetchBookings();
    } catch (err) {
      console.error('Error saving guest customer ID:', err);
    }
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { 
    bookings, 
    isLoading, 
    error, 
    refetch: fetchBookings,
    addGuestCustomerId
  };
};

