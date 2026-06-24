const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findServices() {
  console.log('--- Finding services for testing ---');

  // 1. Find a Hotel with stop sell
  const { data: stopSellPricing } = await supabase
    .from('service_pricing')
    .select('service_id, variant_id, date_from, date_to, is_stop_sell')
    .eq('is_stop_sell', true)
    .limit(1);
  console.log('\n1. Stop Sell Override:', stopSellPricing);

  // 2. Find a Tour/Activity with price_type override
  const { data: perNightPricing } = await supabase
    .from('service_pricing')
    .select('service_id, variant_id, price, price_type, label')
    .eq('price_type', 'per_night')
    .limit(5);
  
  if (perNightPricing && perNightPricing.length > 0) {
    for (const p of perNightPricing) {
      const { data: svc } = await supabase
        .from('services')
        .select('name, service_type, pricing_model_override')
        .eq('id', p.service_id)
        .single();
      console.log(`- Service ID: ${p.service_id}, Name: ${svc?.name}, Type: ${svc?.service_type}, Override: ${svc?.pricing_model_override}, Price Type: ${p.price_type}`);
    }
  }

  // 3. Find a Room with occupancy pricing
  const { data: occupancyPricing } = await supabase
    .from('service_pricing')
    .select('service_id, variant_id, occupancy_pricing')
    .not('occupancy_pricing', 'is', null)
    .limit(1);
  console.log('\n3. Occupancy Pricing:', occupancyPricing);
  if (occupancyPricing && occupancyPricing.length > 0) {
    const { data: svc } = await supabase.from('services').select('name').eq('id', occupancyPricing[0].service_id).single();
    console.log(`- Service Name: ${svc?.name}`);
  }

  // 4. Find service with meal plans configured
  const { data: mealPlanServices } = await supabase
    .from('services')
    .select('id, name, meal_plans')
    .not('meal_plans', 'is', null)
    .limit(3);
  console.log('\n4. Services with Meal Plans:', JSON.stringify(mealPlanServices, null, 2));

  // 5. Find a Day Package/Evening Package service
  const { data: daySvc } = await supabase
    .from('services')
    .select('id, name, service_type')
    .in('service_type', ['day_package', 'evening_package'])
    .limit(2);
  console.log('\n5. Day/Evening Packages:', daySvc);

  process.exit(0);
}

findServices().catch(console.error);
