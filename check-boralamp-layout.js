const layout = require('./backend/config/product-layout.json');
console.log('Layout counts:');
console.log('- Home:', layout.home.length);
console.log('- Sidebar:', layout.sidebar.length);
console.log('- Hidden:', layout.hidden.length);

const boralampId = 'V0103929';
console.log('\nBoralamp (V0103929) location:');
if (layout.home.includes(boralampId)) {
  console.log('✓ In HOME');
}
if (layout.sidebar.includes(boralampId)) {
  console.log('✓ In SIDEBAR');
}
if (layout.hidden.includes(boralampId)) {
  console.log('✓ In HIDDEN');
}
if (!layout.home.includes(boralampId) && !layout.sidebar.includes(boralampId) && !layout.hidden.includes(boralampId)) {
  console.log('✗ NON PRESENTE NEL LAYOUT');
}
