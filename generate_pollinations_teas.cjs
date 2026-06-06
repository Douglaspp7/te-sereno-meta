const fs = require('fs');
const path = require('path');
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => reject(err));
    });
  });
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '_')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const remainingTeas = [
  { day: 18, name: "Té de Moringa", ingredients: "water, dried moringa leaves. The color should be intensely earthy green." },
  { day: 19, name: "Té Pu-erh (Té Rojo)", ingredients: "water, fermented pu-erh tea leaves. Dark reddish-brown liquor." },
  { day: 20, name: "Agua con Limón y Chia", ingredients: "water, lemon juice, chia seeds. A refreshing and hydrating mix." },
  { day: 21, name: "Mezcla Especial MiReto21", ingredients: "water, green tea, fresh ginger, turmeric, lemon. A golden celebration tea." }
];

async function main() {
  const teasDir = path.join(__dirname, 'public', 'images', 'teas');
  
  console.log("Generating missing images via Pollinations.ai...");
  for (const tea of remainingTeas) {
    const newSlug = slugify(tea.name);
    const filepath = path.join(teasDir, `${newSlug}.png`);
    
    console.log(`Generating image for ${tea.name}...`);
    try {
      const prompt = `Hyper-realistic high-quality professional food photography of ${tea.name} in a beautiful aesthetic mug. Ingredients: ${tea.ingredients}. The scene should be beautiful, warm lighting, sharp focus, vibrant colors, appetizing. No text.`;
      
      const encodedPrompt = encodeURIComponent(prompt);
      // seed for randomness, width, height, nologo
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 10000)}&nologo=true`;
      
      console.log(`Downloading ${tea.name}...`);
      await downloadImage(url, filepath);
      console.log(`Saved ${tea.name} to ${filepath}`);
    } catch (err) {
      console.error(`Error generating ${tea.name}:`, err.message);
    }
  }
}

main();
