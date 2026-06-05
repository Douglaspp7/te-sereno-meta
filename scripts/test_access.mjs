import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://euwckzpwmvbzliifcmyp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d2NrenB3bXZiemxpaWZjbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDA5MDIsImV4cCI6MjA5NjE3NjkwMn0.lQuTvbxew04dLpkzlgT3CXKajbzo8dxEJPd7mjOrcGg"
);


async function checkAccess() {
  const { data, error } = await supabase.from('exercises').select('*').limit(2);
  console.log("Data:", data);
  console.log("Error:", error);
}

checkAccess();
