/**
 * Authoritative lead price calculator for services across mobile app.
 * Handles base service price, service_pricing rows, AND room_types JSONB array.
 * Synchronized with the authoritative web-app pricing engine.
 */
export function calculateLeadPrice(
    servicePricing?: any[], 
    serviceType?: string, 
    baseServicePrice?: number,
    roomTypes?: any[]
): number {
    const fallback = Number(baseServicePrice || 0);
    const validPrices: number[] = [];

    if (fallback > 0) {
        validPrices.push(fallback);
    }

    // 1. Extract pricing from room_types (JSONB or array)
    if (roomTypes && Array.isArray(roomTypes) && roomTypes.length > 0) {
        roomTypes.forEach(room => {
            if (!room) return;
            const p = Number(room.price || room.weekday_price || room.weekend_price || 0);
            if (p > 0) validPrices.push(p);

            if (room.prices && typeof room.prices === 'object') {
                Object.values(room.prices).forEach(val => {
                    const parsed = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
                    if (!isNaN(parsed) && parsed > 0) validPrices.push(parsed);
                });
            }
        });
    }

    // 2. Extract pricing from service_pricing rows
    if (servicePricing && Array.isArray(servicePricing) && servicePricing.length > 0) {
        servicePricing.forEach(g => {
            const basePrice = Number(g.price || 0);
            if (basePrice > 0) validPrices.push(basePrice);

            const occ = g.occupancy_pricing;
            if (occ && typeof occ === 'object') {
                if (serviceType?.toLowerCase() === 'hotel' || serviceType?.toLowerCase() === 'stays') {
                    const dbl = occ['2'] ?? occ[2];
                    if (dbl !== undefined && dbl !== null) {
                        const dblVal = typeof dbl === 'object' ? Number(dbl.price || dbl.adult || 0) : Number(dbl);
                        if (dblVal > 0) validPrices.push(dblVal);
                    }
                }

                const sgl = occ['1'] ?? occ[1];
                if (sgl !== undefined && sgl !== null) {
                    const sglVal = typeof sgl === 'object' ? Number(sgl.price || sgl.adult || 0) : Number(sgl);
                    if (sglVal > 0) validPrices.push(sglVal);
                }

                Object.values(occ).forEach(o => {
                    const val = typeof o === 'object' && o !== null ? Number((o as any).price || (o as any).adult || 0) : Number(o);
                    if (!isNaN(val) && val > 0) validPrices.push(val);
                });
            }
        });
    }

    const positivePrices = validPrices.filter(p => !isNaN(p) && p > 0);
    return positivePrices.length > 0 ? Math.min(...positivePrices) : fallback;
}
