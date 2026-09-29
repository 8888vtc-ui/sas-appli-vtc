import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://imddzjdomjhjfudkqmib.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZGR6amRvbWpoamZ1ZGtxbWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjk4MjksImV4cCI6MjA5Njc0NTgyOX0.d27M9acCYmwmSDEgSa0ZwGEzvLm-HOC8ty9-yJdZZA4'
);

async function test() {
  console.log('Testing auth signUp...');
  const { data: auth, error: authErr } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@maboite.fr',
    password: 'password123'
  });
  console.log('Auth:', auth, 'Err:', authErr);
  
  console.log('Testing companies insert...');
  const { data: comp, error: compErr } = await supabase.from('companies').insert([{
    name: 'Test Company'
  }]).select().single();
  console.log('Comp:', comp, 'Err:', compErr);
}

test();
