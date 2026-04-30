// Image compression script — converts heavy PNGs to WebP
// Uses Sharp (already bundled inside Next.js node_modules)
const sharp = require('./node_modules/sharp');
const path = require('path');
const fs = require('fs');

const imgDir = path.join(__dirname, 'public', 'img');

// Files to compress (heavy ones > 200KB)
const targets = [
  'hero.png',
  'who-we-are.png',
  'about-background.png',
  'advertising.png',
  'coding.png',
  'content.png',
  'digital.png',
  'facebook-bramd.png',
  'footer_bg.png',
  'founder.png',
  'header-keyboard.png',
  'header-responsive.png',
  'marketing.png',
  'paper-text.png',
  'pen with hand.png',
  'software.png',
  'team-member.png',
  'typing.png',
  'Boy.png',
  'Girl-2.png',
];

async function compress() {
  let totalSaved = 0;
  
  for (const file of targets) {
    const inputPath = path.join(imgDir, file);
    const outputName = file.replace('.png', '.webp').replace(/\s/g, '-');
    const outputPath = path.join(imgDir, outputName);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠  Skipped (not found): ${file}`);
      continue;
    }
    
    try {
      const beforeSize = fs.statSync(inputPath).size;
      
      await sharp(inputPath)
        .webp({ quality: 82, effort: 4 })
        .toFile(outputPath);
      
      const afterSize = fs.statSync(outputPath).size;
      const saved = Math.round((beforeSize - afterSize) / 1024);
      totalSaved += saved;
      
      const pct = Math.round((1 - afterSize / beforeSize) * 100);
      console.log(`✓  ${file.padEnd(30)} ${Math.round(beforeSize/1024)}KB → ${Math.round(afterSize/1024)}KB  (−${pct}%)`);
    } catch (err) {
      console.error(`✗  Error on ${file}:`, err.message);
    }
  }
  
  console.log(`\n📦 Total saved: ~${totalSaved}KB`);
  console.log('\n✅ Done! Update your Next.js <Image> src props from .png to .webp');
}

compress();
