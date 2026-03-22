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
  if (!url) return require('../../assets/hero-hotel.png'); // Default fallback

  // 1. Handle bundle assets (if starting with /assets/ or a relative path we recognize)
  if (url.startsWith('assets/') || url.includes('/assets/')) {
    // Map known web-app placeholders to mobile assets
    if (url.includes('activities')) return require('../../assets/categories/activities.png');
    if (url.includes('day-packages')) return require('../../assets/categories/day-packages.png');
    if (url.includes('cruises')) return require('../../assets/categories/cruises.png');
    if (url.includes('rodrigues')) return require('../../assets/categories/rodrigues.png');
    
    // Generic placeholder fallback for other asset paths
    return require('../../assets/hero-hotel.png');
  }

  // 2. Handle Absolute URLs (external or already resolved)
  if (url.startsWith('http')) {
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
  if (!supabaseUrl) return { uri: url }; // Fallback to raw string if no env

  if (width || height) {
    // Supabase Image Transformation URL format
    const renderUrl = `${supabaseUrl}/storage/v1/render/image/public/services/${url}`;
    const separator = '?';
    let transform = '';
    if (width) transform += `width=${width}`;
    if (height) transform += `${transform ? '&' : ''}height=${height}`;
    return { uri: `${renderUrl}${separator}${transform}&quality=80&resize=contain` };
  }

  const storageUrl = `${supabaseUrl}/storage/v1/object/public/services/`;
  return { uri: `${storageUrl}${url}` };
};
