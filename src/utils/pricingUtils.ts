/**
 * Lead price calculator for services.
 * Standardizes logic across the mobile app to handle complex occupancy_pricing objects (JSONB).
 * This logic is synchronized with the authoritative web-app pricing engine.
 */
// PRESERVED: export function calculateLeadPrice(servicePricing: any[], serviceType: string): number {
export function calculateLeadPrice(servicePricing: any[], serviceType: string, baseServicePrice?: number): number {
    const fallback = Number(baseServicePrice || 0);
    if (!servicePricing || servicePricing.length === 0) return fallback;

    const prices = servicePricing.map(g => {
        const basePrice = Number(g.price || 0);
        const occ = g.occupancy_pricing;
        
        if (occ && typeof occ === 'object') {
            // For hotels, strictly prioritize Double (2) as the lead price
            if (serviceType?.toLowerCase() === 'hotel' || serviceType?.toLowerCase() === 'stays') {
                const dbl = occ['2'] ?? occ[2];
                if (dbl !== undefined && dbl !== null) {
                    return typeof dbl === 'object' ? Number(dbl.price || dbl.adult || 0) : Number(dbl);
                }
            }

            // For activities/others, prioritize Single (1) or the lowest adult tier
            const sgl = occ['1'] ?? occ[1];
            if (sgl !== undefined && sgl !== null) {
                return typeof sgl === 'object' ? Number(sgl.price || sgl.adult || 0) : Number(sgl);
            }

            const adultPrices = Object.values(occ)
                .map(o => (typeof o === 'object' && o !== null ? Number((o as any).price || (o as any).adult || 0) : Number(o)))
                .filter(p => p > 0);
            
            if (adultPrices.length > 0) {
                const minAdult = Math.min(...adultPrices);
                // Return the lower of the base price (if set) and the cheapest adult tier
                return basePrice > 0 ? Math.min(basePrice, minAdult) : minAdult;
            }
        }
        
        return basePrice;
    }).filter(p => !isNaN(p) && p > 0);

    const calculated = prices.length > 0 ? Math.min(...prices) : 0;
    return calculated > 0 ? calculated : fallback;
}

