require('dotenv').config();

console.log('=== VERIFICA ENVIRONMENT ===\n');

console.log('BIGBUY_API_KEY presente:', !!process.env.BIGBUY_API_KEY);
console.log('BIGBUY_API_KEY lunghezza:', process.env.BIGBUY_API_KEY?.length || 0);
console.log('BIGBUY_API_KEY primi 20 caratteri:', process.env.BIGBUY_API_KEY?.substring(0, 20) || 'NESSUNA');
console.log('BIGBUY_API_URL:', process.env.BIGBUY_API_URL);

console.log('\nAPI key completa (nascosta parzialmente):');
if (process.env.BIGBUY_API_KEY) {
    const key = process.env.BIGBUY_API_KEY;
    console.log(`${key.substring(0, 10)}...${key.substring(key.length - 10)}`);
} else {
    console.log('❌ API KEY NON TROVATA');
}
