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
  image_url: string;
  link: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  location?: string;
};

export const useHomeData = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch Hero Slides
        const { data: slides, error: slidesError } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (slidesError) throw slidesError;

        // Fetch Categories
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .eq('show_on_home', true)
          .order('display_order', { ascending: true });

        if (catsError) throw catsError;

        // Fetch Featured Services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(10);

        if (servicesError) throw servicesError;

        setHeroSlides(slides || []);
        setCategories(cats || []);
        setFeaturedServices(services || []);
      } catch (err: any) {
        console.error('Error fetching home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { heroSlides, categories, featuredServices, loading, error };
};
