// Category fallback asset mapper for offline / empty image URLs
export const getCategoryFallbackAsset = (contextKey?: string): ImageSourcePropType => {
  const key = (contextKey || '').toLowerCase().trim();
  if (key.includes('hotel') || key.includes('stay')) return require('../../assets/categories/hotels.jpg');
  if (key.includes('day-package') || key.includes('day_package') || key.includes('evening')) return require('../../assets/categories/day-packages.jpg');
  if (key.includes('cruise') || key.includes('sea')) return require('../../assets/categories/cruises.jpg');
  if (key.includes('tour') || key.includes('package') || key.includes('travel') || key.includes('mauritius')) return require('../../assets/categories/group-tours.jpg');
  if (urlKeyMatch(key, 'rodrigues')) return require('../../assets/categories/rodrigues.jpg');
  if (key.includes('flight')) return require('../../assets/categories/flights.jpg');
  if (key.includes('activity') || key.includes('activities') || key.includes('land')) return require('../../assets/categories/activities.jpg');
  return require('../../assets/categories/activities.jpg');
};

function urlKeyMatch(str: string, target: string): boolean {
  return str.includes(target);
}

/**
 * Resolves an image URL from the database into a React Native Image source.
 * Handles:
 * 1. Absolute URLs
 * 2. Supabase relative storage paths (services/..., hotels/...)
 * 3. Mobile bundle assets for categories
 */
export const resolveImageUrl = (
  url: string | null | undefined, 
  width?: number, 
  height?: number,
  categoryContext?: string
) => {
  if (!url || url.trim() === '') {
    if (categoryContext) return getCategoryFallbackAsset(categoryContext);
    return require('../../assets/icon.png');
  }

  // 1. Handle bundle assets (if starting with /assets/ or relative path we recognize)
  if (typeof url === 'string' && (url.startsWith('assets/') || url.includes('/assets/'))) {
    if (url.includes('activities')) return require('../../assets/categories/activities.jpg');
    if (url.includes('day-packages')) return require('../../assets/categories/day-packages.jpg');
    if (url.includes('cruises')) return require('../../assets/categories/cruises.jpg');
    if (url.includes('group-tours') || url.includes('group_tours')) return require('../../assets/categories/group-tours.jpg');
    if (url.includes('rodrigues')) return require('../../assets/categories/rodrigues.jpg');
    if (url.includes('hotels')) return require('../../assets/categories/hotels.jpg');
    if (url.includes('flights')) return require('../../assets/categories/flights.jpg');
 
    if (url.includes('hero-flight')) return require('../../assets/placeholders/hero-flight.jpg');
    if (url.includes('hero-cruise')) return require('../../assets/placeholders/hero-cruise.jpg');
    if (url.includes('hero-hotel')) return require('../../assets/placeholders/hero-hotel.jpg');
    if (url.includes('hero-adventure')) return require('../../assets/placeholders/hero-adventure.jpg');
    
    if (categoryContext) return getCategoryFallbackAsset(categoryContext);
    return require('../../assets/icon.png');
  }

  // 2. Handle Absolute URLs (external or already resolved)
  if (typeof url === 'string' && url.startsWith('http')) {
    let finalUrl = url;
    // PRESERVED ORIGINAL TRANSFORM URL LOGIC AS COMMENT PER USER RULES:
    /*
    if (url.includes('supabase.co/storage/v1/render/image/public') || url.includes('supabase.co/storage/v1/object/public')) {
      const separator = url.includes('?') ? '&' : '?';
      if (width) finalUrl += `${separator}width=${width}`;
      if (height) finalUrl += `${finalUrl.includes('?') ? '&' : '?'}height=${height}`;
      if (width || height) finalUrl += `&quality=80&resize=contain`;
    }
    */
    // Clean URL resolution without broken render params:
    if (url.includes('supabase.co/storage/v1/render/image/public')) {
      finalUrl = url.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/').split('?')[0];
    }
    return { uri: finalUrl };
  }

  // 3. Handle Relative Supabase Paths
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tbyudagfjspedeqtlgjv.supabase.co';
  if (!supabaseUrl || typeof url !== 'string') return { uri: url || '' };

  let filePath = url;
  let finalBucket = 'bucket';

  if (url.startsWith('bucket/')) {
    filePath = url.replace('bucket/', '');
  }

  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${finalBucket}/${filePath}`;
  
  // PRESERVED ORIGINAL RENDER TRANSFORMATION CODE COMMENTED OUT PER USER RULES:
  /*
  if (width || height) {
    const renderUrl = `${supabaseUrl}/storage/v1/render/image/public/${finalBucket}/${filePath}`;
    let transform = '?';
    if (width) transform += `width=${width}`;
    if (height) transform += `${transform.length > 1 ? '&' : ''}height=${height}`;
    return { uri: `${renderUrl}${transform}&quality=80&resize=cover` };
  }
  */

  // Return reliable 200 OK object storage URL natively supported by Supabase
  return { uri: baseUrl };
};

