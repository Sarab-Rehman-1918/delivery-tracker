// server/src/config/supabase.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

supabase.auth.getSession()
  .then(() => console.log('✅ Supabase Connected!'))
  .catch((err) => console.log('❌ Supabase Error:', err.message));

module.exports = supabase;