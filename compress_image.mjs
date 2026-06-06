import sharp from 'sharp';
import fs from 'fs';

async function compressImage() {
  const input = 'public/images/entrada.jpg';
  const output = 'public/images/entrada_optimized.webp';

  console.log('Compressing image...');
  await sharp(input)
    .resize(1080) // Resize width to 1080px, maintaining aspect ratio
    .webp({ quality: 75 }) // Convert to webp with 75% quality
    .toFile(output);

  const stats = fs.statSync(output);
  console.log(`Successfully compressed to ${output}. New size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

compressImage().catch(console.error);
