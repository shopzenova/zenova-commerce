const axios = require('axios');
require('dotenv').config();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 60000 });

async function main() {
  // 1. Check data feed JSON
  console.log('=== DATA FEED JSON ===');
  try {
    const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
    const feed = feedRes.data;

    // Check what format it is
    console.log('Type:', typeof feed);
    if (Array.isArray(feed)) {
      console.log('Array length:', feed.length);
      // Look for AATOM products
      const aatom = feed.filter(p => (p.code || p.Code || '').toUpperCase().includes('AATOM'));
      console.log('AATOM in feed:', aatom.length);
      if (aatom.length > 0) {
        console.log('Sample:', JSON.stringify(aatom[0]).substring(0, 300));
      }
      // Look for ZCC
      const zcc = feed.filter(p => (p.code || p.Code || '').toUpperCase().includes('ZCC'));
      console.log('ZCC in feed:', zcc.length);
    } else if (typeof feed === 'object') {
      const keys = Object.keys(feed);
      console.log('Object keys:', keys.slice(0, 10));
      if (feed.data && Array.isArray(feed.data)) {
        console.log('Data array length:', feed.data.length);
        const aatom = feed.data.filter(p => (p.code || '').toUpperCase().includes('AATOM'));
        console.log('AATOM in feed.data:', aatom.length);
      }
    }
  } catch (err) {
    console.log('Feed JSON error:', err.response?.status, err.message);
  }

  // 2. Try the CSV feed URL directly
  console.log('\n=== CSV FEED (AATOM family) ===');
  try {
    const csvRes = await axios.get('https://www.aw-dropship.eu/aatom-dssk/data-feed.csv', { timeout: 30000 });
    const lines = csvRes.data.split('\n');
    console.log('CSV lines:', lines.length);
    console.log('Header:', lines[0].substring(0, 200));
    if (lines.length > 1) {
      console.log('First row:', lines[1].substring(0, 200));
    }
    // Count AATOM
    const aatomLines = lines.filter(l => l.toUpperCase().includes('AATOM'));
    console.log('AATOM rows:', aatomLines.length);
  } catch (err) {
    console.log('CSV error:', err.response?.status, err.message);
  }

  // 3. Check all data feed endpoints
  console.log('\n=== OTHER FEED ENDPOINTS ===');
  const endpoints = [
    '/dropshipping/my-products-data-feed-json',
    '/dropshipping/products/data-feed-json',
  ];
  for (const ep of endpoints) {
    try {
      const r = await client.get(ep);
      const data = r.data;
      const count = Array.isArray(data) ? data.length : (data.data ? data.data.length : 'unknown');
      console.log(`${ep}: ${count} items`);
    } catch (err) {
      console.log(`${ep}: ERROR ${err.response?.status}`);
    }
  }
}
main().catch(e => console.error('ERROR:', e.message));
