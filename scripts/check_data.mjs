process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const SUPABASE_URL = "https://euwckzpwmvbzliifcmyp.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d2NrenB3bXZiemxpaWZjbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDA5MDIsImV4cCI6MjA5NjE3NjkwMn0.lQuTvbxew04dLpkzlgT3CXKajbzo8dxEJPd7mjOrcGg";

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/days?day_number=eq.1&select=*,exercises(*)`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  console.log(await res.json());
}
run();
