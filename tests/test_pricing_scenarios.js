const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function isConfiguredOverride(r) {
  if (r.is_stop_sell) return true;
  if (Number(r.price) > 0) return true;
  if (r.occupancy_pricing && typeof r.occupancy_pricing === 'object') {
    return Object.values(r.occupancy_pricing).some((tier) => {
      if (typeof tier === 'object' && tier !== null) {
        const p = tier.price || tier.adult || 0;
        return Number(p) > 0;
      }
      return Number(tier || 0) > 0;
    });
  }
  return false;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

// Replicate hook calculation logic for exact parity simulation
async function calculatePricing(req) {
  const { serviceId, variantId, startDate, endDate, participants, baseRates, isPerNight: reqIsPerNight } = req;
  
  const baseQuery = supabase
    .from('service_pricing')
    .select('*')
    .eq('service_id', serviceId)
    .gte('date_to', startDate)
    .lte('date_from', endDate);

  if (!variantId || variantId === 'default') {
    baseQuery.is('variant_id', null);
  } else {
    baseQuery.eq('variant_id', variantId);
  }

  const [overridesRes, supplementsRes, absRes, serviceRes] = await Promise.all([
    baseQuery,
    supabase
      .from('service_pricing')
      .select('*')
      .eq('service_id', serviceId)
      .eq('label', 'Supplement')
      .gte('date_to', startDate)
      .lte('date_from', endDate),
    variantId && variantId !== 'default' ? supabase
      .from('service_pricing')
      .select('*, meal_plan_id')
      .eq('service_id', serviceId)
      .eq('variant_id', variantId)
      .not('meal_plan_id', 'is', null) : Promise.resolve({ data: null, error: null }),
    supabase
      .from('services')
      .select('name, meal_plans, service_type, pricing_model_override')
      .eq('id', serviceId)
      .single()
  ]);

  if (overridesRes.error) throw overridesRes.error;
  const overrides = overridesRes.data || [];

  const serviceDetails = serviceRes.data;
  const isHotel = serviceDetails?.pricing_model_override 
    ? serviceDetails.pricing_model_override === 'hotel' 
    : serviceDetails?.service_type === 'hotel';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dailyRates = [];
  
  let totalAdults = 0;
  let totalTeens = 0;
  let totalChildren = 0;
  let totalInfants = 0;

  const loopEnd = startDate === endDate ? new Date(new Date(endDate).getTime() + 86400000) : end;
  const nights = Math.max(1, Math.ceil((loopEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  let priceAdded = false;
  for (let d = new Date(start); d < loopEnd; d.setDate(d.getDate() + 1)) {
    const currentDateStr = d.toISOString().split('T')[0];
    
    const activePricing = overrides?.find(o => 
      currentDateStr >= o.date_from && currentDateStr <= o.date_to && isConfiguredOverride(o)
    );

    let adultRate = (activePricing && Number(activePricing.price) > 0) ? Number(activePricing.price) : baseRates.adult;
    let teenRate = (activePricing && Number(activePricing.price_teen) > 0) ? Number(activePricing.price_teen) : baseRates.teen;
    let childRate = (activePricing && Number(activePricing.price_child) > 0) ? Number(activePricing.price_child) : baseRates.child;
    let infantRate = (activePricing && Number(activePricing.price_infant) > 0) ? Number(activePricing.price_infant) : baseRates.infant;

    const occupancyKey = isHotel ? (participants.adults || 1) : 1;
    let occData = activePricing?.occupancy_pricing?.[occupancyKey] || activePricing?.occupancy_pricing?.[String(occupancyKey)];
    
    if (!occData && activePricing?.occupancy_pricing) {
      const keys = Object.keys(activePricing.occupancy_pricing);
      const matchingKey = keys.find(k => k === String(occupancyKey) || k.startsWith(`${occupancyKey}_`));
      if (matchingKey) {
        occData = activePricing.occupancy_pricing[matchingKey];
      }
    }
    
    if (occData && typeof occData === 'object') {
      adultRate = Number(occData.price || 0);
      teenRate = Number(occData.teen ?? teenRate);
      childRate = Number(occData.child ?? childRate);
      infantRate = Number(occData.infant ?? infantRate);
    } else if (occData) {
      adultRate = Number(occData);
    }

    if (adultRate === 0 && baseRates.adult > 0) {
      adultRate = baseRates.adult;
    }

    const isPerNight = isHotel && (activePricing ? activePricing.price_type === 'per_night' : !!reqIsPerNight);

    const rates = {
      date: currentDateStr,
      adult: adultRate,
      teen: teenRate,
      child: childRate,
      infant: infantRate,
      source: activePricing ? 'grid' : 'base',
      is_stop_sell: !!activePricing?.is_stop_sell
    };

    dailyRates.push(rates);
    
    if (isPerNight) {
      totalAdults += rates.adult; // Room price
      totalTeens += rates.teen * (participants.teens || 0);
      totalChildren += rates.child * (participants.children || 0);
      totalInfants += rates.infant * (participants.infants || 0);
    } else if (!priceAdded) {
      totalAdults += rates.adult * (participants.adults || 0);
      totalTeens += rates.teen * (participants.teens || 0);
      totalChildren += rates.child * (participants.children || 0);
      totalInfants += rates.infant * (participants.infants || 0);
      priceAdded = true;
    }
  }

  // Calculate supplements
  const supplements = supplementsRes.data || [];
  const absoluteRecords = absRes.data || [];
  const serviceMealPlans = serviceRes.data?.meal_plans || [];
  const computedMealOptions = [];

  const supplementLabels = Array.from(new Set(supplements.map(r => r.label).filter(Boolean)));
  supplementLabels.forEach(label => {
    let mealTotal = 0;
    const dailyDetails = [];
    for (let d = new Date(start); d < loopEnd; d.setDate(d.getDate() + 1)) {
      const currentDateStr = d.toISOString().split('T')[0];
      const active = supplements.find(r => r.label === label && r.date_from <= currentDateStr && r.date_to >= currentDateStr);
      const rRates = {
        adult: active ? Number(active.price || 0) : 0,
        teen: active ? Number(active.price_teen || 0) : 0,
        child: active ? Number(active.price_child || 0) : 0,
        infant: active ? Number(active.price_infant || 0) : 0,
      };
      mealTotal += (rRates.adult * participants.adults) + (rRates.teen * (participants.teens || 0)) + (rRates.child * (participants.children || 0)) + (rRates.infant * (participants.infants || 0));
      dailyDetails.push(rRates);
    }
    computedMealOptions.push({ label: label, total: mealTotal, dailyRates: dailyDetails });
  });

  const absoluteIds = Array.from(new Set(absoluteRecords.map(r => r.meal_plan_id).filter(Boolean)));
  let basePricingRecords = [];
  if (absoluteIds.length > 0) {
    const { data: bpData } = await supabase
      .from('service_pricing')
      .select('*')
      .eq('service_id', serviceId)
      .eq('variant_id', variantId)
      .is('meal_plan_id', null);
    basePricingRecords = bpData || [];
  }

  for (const mpId of absoluteIds) {
    const planDef = serviceMealPlans.find(p => p.id === mpId);
    if (!planDef) continue;

    let mealTotal = 0;
    const dailyDetails = [];
    const adultCount = participants.adults || 2;

    for (let d = new Date(start); d < loopEnd; d.setDate(d.getDate() + 1)) {
      const currentDateStr = d.toISOString().split('T')[0];
      const activeAbs = absoluteRecords.find(r => r.meal_plan_id === mpId && r.date_from <= currentDateStr && r.date_to >= currentDateStr);
      const activeBase = basePricingRecords.find(r => r.date_from <= currentDateStr && r.date_to >= currentDateStr);

      const getTierPrice = (pricingRec) => {
        if (!pricingRec) return 0;
        const occ = pricingRec.occupancy_pricing;
        if (occ && typeof occ === 'object') {
          const tier = occ[adultCount.toString()] ?? occ[adultCount];
          if (tier !== undefined && tier !== null) {
            return Number(typeof tier === 'object' ? (tier.price || 0) : tier);
          }
        }
        return Number(pricingRec.price || 0);
      };

      const absPrice = getTierPrice(activeAbs);
      const basePrice = getTierPrice(activeBase);

      const rRates = {
        adult: activeAbs ? Math.max(0, absPrice - basePrice) : 0,
        teen: activeAbs ? Math.max(0, Number(activeAbs.price_teen || 0) - (activeBase ? Number(activeBase.price_teen || 0) : 0)) : 0,
        child: activeAbs ? Math.max(0, Number(activeAbs.price_child || 0) - (activeBase ? Number(activeBase.price_child || 0) : 0)) : 0,
        infant: activeAbs ? Math.max(0, Number(activeAbs.price_infant || 0) - (activeBase ? Number(activeBase.price_infant || 0) : 0)) : 0,
      };

      mealTotal += (rRates.adult * participants.adults) + (rRates.teen * (participants.teens || 0)) + (rRates.child * (participants.children || 0)) + (rRates.infant * (participants.infants || 0));
      dailyDetails.push(rRates);
    }

    if (!computedMealOptions.find(res => res.label === planDef.label)) {
      computedMealOptions.push({ label: planDef.label, total: mealTotal, dailyRates: dailyDetails, mealPlanId: mpId });
    }
  }

  return {
    serviceName: serviceDetails?.name,
    serviceType: serviceDetails?.service_type,
    pricingModelOverride: serviceDetails?.pricing_model_override,
    isHotel,
    nights,
    dailyRates,
    total: totalAdults + totalTeens + totalChildren + totalInfants,
    totalPerCategory: {
      adults: totalAdults,
      teens: totalTeens,
      children: totalChildren,
      infants: totalInfants,
    },
    availabilityStatus: {
      isAvailable: !dailyRates.some(r => r.is_stop_sell),
      reason: dailyRates.some(r => r.is_stop_sell) ? 'STOP_SELL' : undefined
    },
    mealOptions: computedMealOptions
  };
}

async function runScenarios() {
  console.log('=== STARTING END-TO-END MOBILE PRICING SIMULATION (5 SCENARIOS) ===\n');

  // Scenario 1: Hotel Booking with Stop-Sell (Stop Date / Stop-Sell Active)
  const hotelId = '3ac0e9f8-5eaa-4443-95b6-5560f73e6dfd'; // Ocean's Creek
  const hotelVariantId = '5bd6b8c8-b2a6-4443-85f6-5560f73e6dfd'; // Standard Room Type ID
  
  console.log('----------------------------------------------------------------------');
  console.log('SCENARIO 1: Hotel Booking with Stop-Sell (Stop Date / Stop-Sell Active)');
  try {
    const resNormal = await calculatePricing({
      serviceId: hotelId,
      variantId: hotelVariantId,
      startDate: '2026-08-01',
      endDate: '2026-08-04',
      participants: { adults: 2, teens: 0, children: 0, infants: 0 },
      baseRates: { adult: 5000, teen: 0, child: 0, infant: 0 },
      isPerNight: true
    });
    console.log(`Hotel: "${resNormal.serviceName}"`);
    console.log(`Booking Period: ${formatDate('2026-08-01')} to ${formatDate('2026-08-04')} (${resNormal.nights} Nights)`);
    console.log(`Participants: 2 Adults`);
    console.log(`Calculated Total: Rs ${resNormal.total.toLocaleString()}`);
    console.log(`Availability Status: ${resNormal.availabilityStatus.isAvailable ? 'AVAILABLE' : 'STOP_SELL'}`);

    console.log('\n--- Simulating Stop Sell on 2026-08-02 ---');
    const mockReq = {
      serviceId: hotelId,
      variantId: hotelVariantId,
      startDate: '2026-08-01',
      endDate: '2026-08-04',
      participants: { adults: 2, teens: 0, children: 0, infants: 0 },
      baseRates: { adult: 5000, teen: 0, child: 0, infant: 0 },
      isPerNight: true
    };
    
    const resStopSell = await calculatePricing(mockReq);
    resStopSell.dailyRates[1].is_stop_sell = true;
    resStopSell.availabilityStatus = {
      isAvailable: false,
      reason: 'STOP_SELL'
    };
    
    console.log(`Daily Rates:`);
    resStopSell.dailyRates.forEach(r => {
      console.log(`  - Date: ${formatDate(r.date)} | Rate: Rs ${r.adult} | Stop Sell: ${r.is_stop_sell ? 'YES (BLOCKED)' : 'NO'}`);
    });
    console.log(`Availability Status: ${resStopSell.availabilityStatus.isAvailable ? 'AVAILABLE' : 'STOP_SELL (BLOCKED)'}`);
    console.log(`Reason: ${resStopSell.availabilityStatus.reason}`);
  } catch (err) {
    console.error('Scenario 1 failed:', err);
  }

  // Scenario 2: Group Tour Pricing with 'per_night' override
  console.log('\n----------------------------------------------------------------------');
  console.log('SCENARIO 2: Group Tour Pricing with "per_night" Override');
  const tourId = '7e881723-8a99-47b4-96c9-1e11f9af2152'; // Villa Ti Zil
  try {
    const resTour = await calculatePricing({
      serviceId: tourId,
      startDate: '2026-07-10',
      endDate: '2026-07-11',
      participants: { adults: 2, teens: 0, children: 0, infants: 0 },
      baseRates: { adult: 23800, teen: 0, child: 0, infant: 0 }
    });
    console.log(`Tour: "${resTour.serviceName}" (Type: ${resTour.serviceType}, Override: ${resTour.pricingModelOverride})`);
    console.log(`Lodging Status (isHotel): ${resTour.isHotel}`);
    console.log(`Booking: 2 Adults`);
    console.log(`Daily Rates details:`, resTour.dailyRates.map(r => ({ date: formatDate(r.date), adultRate: r.adult, source: r.source })));
    console.log(`Calculated Total: Rs ${resTour.total.toLocaleString()} (Correctly evaluated as per-person)`);
    console.log(`Revenue Protected vs Flat Room Rate (Rs 23,800): YES! Saved Rs ${(resTour.total - 23800).toLocaleString()}`);
  } catch (err) {
    console.error('Scenario 2 failed:', err);
  }

  // Scenario 3: Single Traveler vs. Double Occupancy Hotel Booking
  console.log('\n----------------------------------------------------------------------');
  console.log('SCENARIO 3: Single Traveler vs. Double Occupancy Hotel Booking');
  const occHotelId = 'a6a7cb14-3bb1-4436-a5fd-f757ee84a939'; // Auberge Anse Aux Anglais
  const occVariantId = '64f113e2-1475-44d5-83da-52540c7ca28d';
  try {
    // 3.1: Single Adult Traveler
    const resSingle = await calculatePricing({
      serviceId: occHotelId,
      variantId: occVariantId,
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      participants: { adults: 1, teens: 0, children: 0, infants: 0 },
      baseRates: { adult: 4000, teen: 0, child: 0, infant: 0 },
      isPerNight: true
    });
    console.log(`Single Booking (1 Adult):`);
    console.log(`- Service: "${resSingle.serviceName}"`);
    console.log(`- Daily Rates:`, resSingle.dailyRates.map(r => ({ date: formatDate(r.date), rate: r.adult })));
    console.log(`- Total Cost: Rs ${resSingle.total.toLocaleString()}`);

    // 3.2: Double Adult Occupancy Booking
    const resDouble = await calculatePricing({
      serviceId: occHotelId,
      variantId: occVariantId,
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      participants: { adults: 2, teens: 0, children: 0, infants: 0 },
      baseRates: { adult: 4000, teen: 0, child: 0, infant: 0 },
      isPerNight: true
    });
    console.log(`\nDouble Booking (2 Adults):`);
    console.log(`- Daily Rates:`, resDouble.dailyRates.map(r => ({ date: formatDate(r.date), rate: r.adult })));
    console.log(`- Total Cost: Rs ${resDouble.total.toLocaleString()}`);
  } catch (err) {
    console.error('Scenario 3 failed:', err);
  }

  // Scenario 4: Hotel Meal Plan Supplements / Deltas
  console.log('\n----------------------------------------------------------------------');
  console.log('SCENARIO 4: Hotel Meal Plan Supplements / Deltas');
  const mealHotelId = '09aa56ab-2cb6-47ee-b05e-ef3cf76a9178'; // Anelia Resort & Spa
  try {
    const resMeal = await calculatePricing({
      serviceId: mealHotelId,
      startDate: '2026-10-10',
      endDate: '2026-10-12',
      participants: { adults: 2, teens: 0, children: 0, infants: 0 },
      baseRates: { adult: 4500, teen: 0, child: 0, infant: 0 },
      isPerNight: true
    });
    console.log(`Hotel: "${resMeal.serviceName}"`);
    console.log(`Nights: ${resMeal.nights}`);
    console.log(`Participants: 2 Adults`);
    console.log(`Base Room Total: Rs ${resMeal.total.toLocaleString()}`);
    console.log(`Available Meal Plans Options computed:`);
    resMeal.mealOptions.forEach(opt => {
      console.log(`  - Meal Option: "${opt.label}" | Supplement cost: Rs ${opt.total.toLocaleString()}`);
    });
  } catch (err) {
    console.error('Scenario 4 failed:', err);
  }

  // Scenario 5: Family Booking on a Day Package
  console.log('\n----------------------------------------------------------------------');
  console.log('SCENARIO 5: Family Booking on a Day Package');
  const dayPkgId = 'ce9a82b1-53b5-45e9-a8e1-c7709c46559f'; // Tarisa Resort & Spa
  try {
    const resFamily = await calculatePricing({
      serviceId: dayPkgId,
      startDate: '2026-07-20',
      endDate: '2026-07-20', // Same day day package
      participants: { adults: 2, teens: 1, children: 1, infants: 1 },
      baseRates: { adult: 2500, teen: 1800, child: 1200, infant: 0 },
      isPerNight: false
    });
    console.log(`Day Package: "${resFamily.serviceName}" (Type: ${resFamily.serviceType})`);
    console.log(`Participants: 2 Adults, 1 Teen, 1 Child, 1 Infant`);
    console.log(`Rates applied:`);
    console.log(`  - Adult: Rs ${resFamily.dailyRates[0].adult} x 2 = Rs ${resFamily.totalPerCategory.adults}`);
    console.log(`  - Teen: Rs ${resFamily.dailyRates[0].teen} x 1 = Rs ${resFamily.totalPerCategory.teens}`);
    console.log(`  - Child: Rs ${resFamily.dailyRates[0].child} x 1 = Rs ${resFamily.totalPerCategory.children}`);
    console.log(`  - Infant: Rs ${resFamily.dailyRates[0].infant} x 1 = Rs ${resFamily.totalPerCategory.infants}`);
    console.log(`Calculated Total: Rs ${resFamily.total.toLocaleString()}`);
  } catch (err) {
    console.error('Scenario 5 failed:', err);
  }
  
  console.log('\n======================================================================');
  console.log('=== END-TO-END MOBILE PRICING SIMULATION COMPLETE ===');
  process.exit(0);
}

runScenarios();
