const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findStopSell() {
  const { data, error } = await supabase
    .from('service_pricing')
    .select('id, service_id, date_from, date_to, is_stop_sell')
    .eq('is_stop_sell', true)
    .limit(10);
  console.log('Stop Sell Records:', data);
  if (error) console.error(error);
  process.exit(0);
}

findStopSell();
