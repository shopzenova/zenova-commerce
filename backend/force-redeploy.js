const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Aggiungi una riga di log per forzare Railway a fare redeploy completo
const searchStr = "logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);";
const replaceStr = `logger.info(\`🌐 Frontend URL: \${process.env.FRONTEND_URL}\`);
  logger.info(\`🎁 Bundle support enabled - Deploy $(date +%Y%m%d-%H%M)\`);`;

if (content.includes('Bundle support enabled')) {
  console.log('⚠️  Log già presente, aggiorno timestamp...');
  content = content.replace(/Bundle support enabled - Deploy.*?\`/, 'Bundle support enabled - Deploy 20251230-1720`');
} else {
  content = content.replace(searchStr, replaceStr);
}

fs.writeFileSync(serverPath, content);
console.log('✅ server.js aggiornato - Railway farà redeploy completo');
console.log('📝 Questo forzerà il ricaricamento di top-100-products.json');
