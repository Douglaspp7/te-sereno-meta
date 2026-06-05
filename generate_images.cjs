const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dir = path.join(__dirname, 'public', 'images', 'recipes');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err.message);
    });
  });
}

async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/recipes?select=id,name';
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': 'Bearer ' + process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    }
  });
  const recipes = await res.json();
  
  // Download ONE fixed image
  const fixedImagePath = path.join(dir, 'fixed_placeholder.jpg');
  if (!fs.existsSync(fixedImagePath)) {
    console.log('Downloading fixed placeholder image...');
    await downloadImage('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop', fixedImagePath);
  }

  console.log(`Found ${recipes.length} recipes.`);
  let count = 0;
  for (const recipe of recipes) {
    const dest = path.join(dir, `${recipe.id}.jpg`);
    if (fs.existsSync(dest)) {
      continue;
    }
    
    console.log(`Setting fixed image for: ${recipe.name}...`);
    try {
      fs.copyFileSync(fixedImagePath, dest);
      count++;
    } catch (err) {
      console.error(`Failed to copy image for ${recipe.name}:`, err);
    }
  }
  
  console.log(`\nFinished! Applied fixed image to ${count} recipes.`);
}

run().catch(console.error);
