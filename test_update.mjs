import fs from 'fs';

const url = 'https://euwckzpwmvbzliifcmyp.supabase.co/rest/v1/recipes';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d2NrenB3bXZiemxpaWZjbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDA5MDIsImV4cCI6MjA5NjE3NjkwMn0.lQuTvbxew04dLpkzlgT3CXKajbzo8dxEJPd7mjOrcGg';

async function update() {
    const updateUrl = `${url}?id=eq.10388fbb-60ec-4005-a1af-f44236e8cf4c`;
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ image_url: '/images/recipes/10388fbb_60ec_4005_a1af_f44236e8cf4c_img_1780684027129.png' })
    });
    
    console.log(response.status, response.statusText);
    console.log(await response.text());
}
update();
