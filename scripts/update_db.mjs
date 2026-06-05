process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const SUPABASE_URL = "https://euwckzpwmvbzliifcmyp.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d2NrenB3bXZiemxpaWZjbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDA5MDIsImV4cCI6MjA5NjE3NjkwMn0.lQuTvbxew04dLpkzlgT3CXKajbzo8dxEJPd7mjOrcGg";

async function updateVideo(id, url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/exercises?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ video_url: url })
  });
  console.log(`Update ${id}:`, res.status, await res.text());
}

async function run() {
  await updateVideo('40000000-0000-0000-0000-000000004001', 'https://youtu.be/YFAuNBwvugY');
  await updateVideo('40000000-0000-0000-0000-000000004002', 'https://youtu.be/21C7hlYOnwE');
}

run();
