const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const { data: faqs } = await supabase.from('faqs').select('*').limit(1);
  console.log('faqs columns:', faqs ? Object.keys(faqs[0]) : 'not found');
  
  const { data: service_faqs } = await supabase.from('service_faqs').select('*').limit(1);
  console.log('service_faqs columns:', service_faqs ? Object.keys(service_faqs[0]) : 'not found');

  const { data: reviews } = await supabase.from('reviews').select('*').limit(1);
  console.log('reviews columns:', reviews ? Object.keys(reviews[0]) : 'not found');
}

checkTables();
