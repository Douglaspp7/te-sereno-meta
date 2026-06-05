const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\dougl\\.gemini\\antigravity\\brain\\6afd23c0-cd2f-4b58-b1b8-2357ad7cb852';
const destDir = 'C:\\Users\\dougl\\.gemini\\antigravity\\scratch\\te-sereno-meta\\public\\images\\recipes';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));

for (const file of files) {
  // Filename format: e.g. 10388fbb_60ec_4005_a1af_f44236e8cf4c_img_1780684027129.png
  // Or 251c48a6_aec7_4e30_8d12_f7bce57eec71_1780684754273.png
  
  // Extract the UUID part by taking the first 5 parts split by underscore
  const parts = file.split('_');
  if (parts.length >= 5) {
    const uuid = `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}`;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(uuid)) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, `${uuid}.jpg`); // as requested by parent
      
      // Even though they are pngs, parent said format them as JPG or PNG and requested .jpg extension in the message:
      // "/images/recipes/${recipe.id}.jpg"
      // Wait! If they are PNGs and I just rename to .jpg, it might work in browsers but it's technically a PNG. I will just rename.
      
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file} to ${uuid}.jpg`);
    }
  }
}
