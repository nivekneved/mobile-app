/**
 * Strips HTML tags and decodes common entities to make text readable in native components.
 */
export function stripHtml(html: string): string {
    if (!html) return '';
    
    return html
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')   // Decode non-breaking spaces
        .replace(/&amp;/g, '&')    // Decode ampersands
        .replace(/&quot;/g, '"')   // Decode quotes
        .replace(/&apos;/g, "'")   // Decode apostrophes
        .replace(/&lt;/g, '<')     // Decode less than
        .replace(/&gt;/g, '>')     // Decode greater than
        .trim();
}

/**
 * Formats any raw booking ID or UUID into a clean, short Travel Lounge reference (e.g. TL-K8M92P)
 */
export function formatShortBookingRef(rawRef: string | undefined | null): string {
    if (!rawRef) return `TL-${Math.floor(100000 + Math.random() * 900000)}`;
    const str = String(rawRef).trim();
    if (str.toUpperCase().startsWith('TL-') && str.length <= 12) {
        return str.toUpperCase();
    }
    if (str.includes('-') && str.length > 20) {
        return `TL-${str.split('-')[0].toUpperCase()}`;
    }
    if (str.length > 10) {
        return `TL-${str.substring(0, 6).toUpperCase()}`;
    }
    return str.toUpperCase().startsWith('TL-') ? str.toUpperCase() : `TL-${str.toUpperCase()}`;
}
