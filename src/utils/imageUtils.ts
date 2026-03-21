import { ImageSourcePropType } from 'react-native';

const SUPABASE_STORAGE_URL = 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/';

// Mapping for web-app local assets that are referenced in the database but not in storage
const LOCAL_PLACEHOLDERS: Record<string, any> = {
  '/hero-hotel.png': require('../../assets/hero-hotel.png'),
  '/hero-adventure.png': require('../../assets/hero-adventure.png'),
  '/hero-flight.png': require('../../assets/hero-flight.png'),
  '/hero-cruise.png': require('../../assets/hero-cruise.png'),
  '/placeholders/hotel_main.png': require('../../assets/hero-hotel.png'),
  '/placeholders/activity_main.png': require('../../assets/hero-adventure.png'),
  '/placeholders/flight_main.png': require('../../assets/hero-flight.png'),
  '/placeholders/cruise_main.png': require('../../assets/hero-cruise.png'),
};

/**
 * Resolves an image URL from the database into a React Native Image source.
 * Handles:
 * 1. Absolute URLs (http/https)
 * 2. Supabase relative storage paths (services/..., hotels/...)
 * 3. Web-app local relative paths (/hero-hotel.png) -> Maps to local assets
 */
export const resolveImageUrl = (url: string | null | undefined): any => {
  if (!url) {
    return { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=400' };
  }

  // 1. Handle actual URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return { uri: url };
  }

  // 2. Handle known web-app placeholders mapped to local assets
  if (LOCAL_PLACEHOLDERS[url]) {
    return LOCAL_PLACEHOLDERS[url];
  }

  // 3. Handle relative paths (likely Supabase Storage)
  // If it doesn't start with / and isn't a known placeholder, prepend Supabase Storage URL
  if (!url.startsWith('/')) {
    return { uri: `${SUPABASE_STORAGE_URL}${url}` };
  }

  // 4. Fallback for other relative paths starting with /
  // If it's something like /storage/v1/... it's already a path relative to the domain
  if (url.startsWith('/storage/')) {
      return { uri: `https://tbyudagfjspedeqtlgjv.supabase.co${url}` };
  }

  // Final absolute fallback
  return { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=400' };
};
