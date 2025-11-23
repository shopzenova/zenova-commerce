// Reload category-mapping
const fs = require('fs');
const path = require('path');

// Read the file directly to get BLACKLIST_KEYWORDS
const fileContent = fs.readFileSync(path.join(__dirname, 'config', 'category-mapping.js'), 'utf-8');

// Extract BLACKLIST_KEYWORDS array
const match = fileContent.match(/const BLACKLIST_KEYWORDS = \[([\s\S]*?)\];/);
if (!match) {
  console.log('❌ Cannot find BLACKLIST_KEYWORDS');
  process.exit(1);
}

// Parse keywords (simple extraction)
const blacklistSection = match[1];
const keywords = [];
const lines = blacklistSection.split('\n');
for (const line of lines) {
  const matches = line.match(/'([^']+)'/g);
  if (matches) {
    matches.forEach(m => {
      keywords.push(m.replace(/'/g, ''));
    });
  }
}

const text = 'auricolari wireless tws earbuds bluetooth con cancellazione rumore';

console.log('🔍 BLACKLIST CHECK');
console.log('='.repeat(60));
console.log('Text:', text);
console.log('\n❌ Blacklist matches:');

const matches = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));

if (matches.length > 0) {
  matches.forEach(m => console.log(`   - "${m}"`));
} else {
  console.log('   Nessuno!');
}
