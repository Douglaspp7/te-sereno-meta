import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await optimizeFolder(fullPath);
    } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      if (file.includes('entrada_optimized') || file.startsWith('icon-')) continue;

      const ext = path.extname(file);
      const newFile = file.replace(ext, '.webp');
      const newPath = path.join(folderPath, newFile);

      try {
        await sharp(fullPath)
          .webp({ quality: 80 })
          .toFile(newPath);
        console.log(`Optimized ${file} -> ${newFile}`);
        
        // Remove original to save space
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.error(`Failed to optimize ${file}:`, e);
      }
    }
  }
}

async function main() {
  await optimizeFolder('public');
  console.log('Done optimizing images!');
}

main().catch(console.error);
