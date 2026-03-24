import { ImageSourcePropType } from 'react-native';

/**
 * Resolves an image URL from the database into a React Native Image source.
 * Handles:
 * 1. Absolute URLs
 * 2. Supabase relative storage paths (services/..., hotels/...)
 * 3. Mobile bundle assets for categories
 * 
 * Supports dynamic resizing via width/height parameters for Supabase assets.
 */
export const resolveImageUrl = (url: string | null | undefined, width?: number, height?: number) => {
  if (!url) return require('../../assets/icon.png'); // Default fallback to app icon

  // 1. Handle bundle assets (if starting with /assets/ or a relative path we recognize)
  if (typeof url === 'string' && (url.startsWith('assets/') || url.includes('/assets/'))) {
    // Map known web-app placeholders to mobile assets
    if (url.includes('activities')) return require('../../assets/categories/activities.jpg');
    if (url.includes('day-packages')) return require('../../assets/categories/day-packages.jpg');
    if (url.includes('cruises')) return require('../../assets/categories/cruises.jpg');
    if (url.includes('rodrigues')) return require('../../assets/categories/rodrigues.jpg');
    if (url.includes('hotels')) return require('../../assets/categories/hotels.jpg');
    if (url.includes('flights')) return require('../../assets/categories/flights.jpg');
    
    // Generic placeholder fallback for other asset paths
    return require('../../assets/icon.png');
  }

  // 2. Handle Absolute URLs (external or already resolved)
  if (typeof url === 'string' && url.startsWith('http')) {
    let finalUrl = url;
    // Add Supabase resizing parameters if it's a Supabase storage URL
    if (url.includes('supabase.co/storage/v1/render/image/public') || url.includes('supabase.co/storage/v1/object/public')) {
      const separator = url.includes('?') ? '&' : '?';
      if (width) finalUrl += `${separator}width=${width}`;
      if (height) finalUrl += `${finalUrl.includes('?') ? '&' : '?'}height=${height}`;
      if (width || height) finalUrl += `&quality=80&resize=contain`;
    }
    return { uri: finalUrl };
  }

  // 3. Handle Relative Supabase Paths (assumed to be in 'services' bucket by default)
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || typeof url !== 'string') return { uri: url || '' }; // Fallback to raw string if no env or not a string

  if (width || height) {
    // Supabase Image Transformation URL format
    // Updated to include 'bucket/' before 'services/' as per actual database paths
    const renderUrl = `${supabaseUrl}/storage/v1/render/image/public/bucket/services/${url}`;
    const separator = '?';
    let transform = '';
    if (width) transform += `width=${width}`;
    if (height) transform += `${transform ? '&' : ''}height=${height}`;
    return { uri: `${renderUrl}${separator}${transform}&quality=80&resize=contain` };
  }

  // Updated to include 'bucket/' before 'services/' as per actual database paths
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/bucket/services/`;
  return { uri: `${storageUrl}${url}` };
};
