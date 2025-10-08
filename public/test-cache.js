// Test script to verify image preloading works
// Run this in browser console to check cache status

console.log('🔍 Checking image cache status...');

const testImages = [
  '/cliniwatch-1.png',
  '/portfolio-1.png',
  '/Subject.png',
  '/logo.png',
  '/react-logo.png',
  '/python-logo.png',
  '/js-logo.png',
  '/tensorflow-logo.png',
  '/r-logo.png',
  '/sql-logo.png'
];

testImages.forEach(src => {
  const img = new Image();
  const start = performance.now();
  
  img.onload = () => {
    const loadTime = performance.now() - start;
    const cached = loadTime < 5; // If loads in <5ms, likely cached
    console.log(`${cached ? '✅' : '❌'} ${src}: ${loadTime.toFixed(2)}ms ${cached ? '(cached)' : '(network)'}`);
  };
  
  img.onerror = () => {
    console.log(`❌ ${src}: Failed to load`);
  };
  
  img.src = src;
});

console.log('⏳ Loading images to test cache...');