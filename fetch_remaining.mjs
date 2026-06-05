import fs from 'fs';

const url = 'https://euwckzpwmvbzliifcmyp.supabase.co/rest/v1/recipes';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d2NrenB3bXZiemxpaWZjbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDA5MDIsImV4cCI6MjA5NjE3NjkwMn0.lQuTvbxew04dLpkzlgT3CXKajbzo8dxEJPd7mjOrcGg';

async function getRecipes() {
  const response = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await response.json();
  const toUpdate = data.filter(r => !r.image_url.includes('/images/recipes/'));
  fs.writeFileSync('recipes_to_update.json', JSON.stringify(toUpdate.map(r => ({id: r.id, name: r.name, image_url: r.image_url})), null, 2));
  console.log(`Recipes to update: ${toUpdate.length}`);
}

getRecipes();
