import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  media_type: string;
  cta_text?: string;
  cta_link?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  link: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  base_price: number; // Actual column name
  price: number;      // mapped for UI
  image_url: string;
  service_type: string; // Actual column name
  category: string;     // mapped for UI
  location?: string;
  amenities?: string[];
  itinerary?: { time: string; title: string; description: string }[];
  room_types?: any[]; // JSON column
};

export const useHomeData = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Hero Slides
        const { data: slides, error: slidesError } = await supabase
          .from('hero_slides')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (slidesError) {
          console.error('Supabase error (hero_slides):', slidesError);
          throw slidesError;
        }

        // Fetch Categories
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false });

        if (catsError) {
          console.error('Supabase error (categories):', catsError);
          throw catsError;
        }

        // Fetch Featured Services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .limit(10);

        if (servicesError) {
          console.error('Supabase error (services):', servicesError);
          throw servicesError;
        }

        const mappedServices = (services || []).map((s: any) => ({
          ...s,
          price: s.base_price || 0,
          category: s.service_type || 'Experience'
        }));

        setHeroSlides(slides || []);
        setCategories(cats || []);
        setFeaturedServices(mappedServices);
      } catch (err: any) {
        console.error('Home Data Error:', err.message || err);
        setError(err.message || 'An error occurred while loading home data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { heroSlides, categories, featuredServices, isLoading, error };
};
