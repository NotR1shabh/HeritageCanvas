// Normalize Map Image Filenames
// Run from project root: node client/scripts/normalize-map-names.js
// 
// This script renames map images in client/public/images/Maps/ 
// to match empire IDs for consistent detection by TimelineNotifierPanel
//
// BACKUP YOUR FILES BEFORE RUNNING THIS SCRIPT!

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'Maps');

const metadata = [
  { id: 'indus_valley', names: ['indus', 'indusvalley', 'indus_valley', 'indusvalleycivilisation'] },
  { id: 'vedic_period', names: ['vedic', 'vedicperiod', 'vedic_period'] },
  { id: 'mahajanapadas', names: ['mahajanapadas', 'mahajan'] },
  { id: 'maurya', names: ['maurya', 'mauryaempire', 'mauryaemp'] },
  { id: 'gupta', names: ['gupta', 'guptaempire'] },
  { id: 'chola', names: ['chola', 'cholaempire'] },
  { id: 'delhi_sultanate', names: ['delhi', 'delhisultanate', 'delhisultan'] },
  { id: 'vijayanagara', names: ['vijayanagar', 'vijayanagara'] },
  { id: 'mughal', names: ['mughal', 'mughalempire'] },
  { id: 'british_raj', names: ['british', 'britishraj', 'british_raj'] },
  { id: 'republic_of_india', names: ['republic', 'india', 'republicofindia', 'republic_of_india'] }
];

console.log('Normalizing map image filenames...');
console.log(`Directory: ${dir}\n`);

if (!fs.existsSync(dir)) {
  console.error(`ERROR: Directory not found: ${dir}`);
  console.error('Please ensure the path is correct.');
  process.exit(1);
}

const files = fs.readdirSync(dir);
let renamed = 0;
let skipped = 0;

files.forEach(file => {
  const lower = file.toLowerCase();
  let matched = false;

  for (const m of metadata) {
    if (matched) break;

    for (const token of m.names) {
      if (lower.includes(token)) {
        const ext = path.extname(file).toLowerCase();
        const target = `${m.id}${ext}`;
        const fromPath = path.join(dir, file);
        const toPath = path.join(dir, target);

        if (fromPath === toPath) {
          console.log(`✓ Already normalized: ${file}`);
          skipped++;
          matched = true;
          break;
        }

        if (!fs.existsSync(toPath)) {
          console.log(`→ Renaming: ${file} -> ${target}`);
          fs.renameSync(fromPath, toPath);
          renamed++;
          matched = true;
          break;
        } else {
          console.log(`⚠ Target exists, skipping: ${file} (would rename to ${target})`);
          skipped++;
          matched = true;
          break;
        }
      }
    }
  }

  if (!matched) {
    console.log(`? No match found for: ${file} (keeping as-is)`);
    skipped++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`Done! Renamed: ${renamed} | Skipped: ${skipped}`);
console.log('='.repeat(50));
