import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RoomType {
  id: string;
  name: string;
  weekday_price: number;
  weekend_price: number;
  image_url?: string;
  amenities?: string[];
}

export const useRoomTypes = (serviceId: string | undefined) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        const { data, error: roomError } = await supabase
          .from('room_types')
          .select('*')
          .eq('service_id', serviceId);

        if (roomError) throw roomError;
        setRoomTypes(data || []);
      } catch (err: any) {
        console.error('Error fetching room types:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [serviceId]);

  return { roomTypes, loading, error };
};
