// Browser Console Test Script for TimelineNotifierPanel
// Copy and paste these snippets into your browser's DevTools Console
// to test the timeline notifier functionality

// =====================================================
// TEST 1: Check Image Detection for All Empires
// =====================================================
// This probes /images/Maps/ for each empire's image file
// Run this to see which images are detected and which are missing

console.log('🔍 Testing image detection for all empires...\n');

(async () => {
  const EMPIRES = [
    { id: 'indus_valley', name: 'Indus Valley Civilization' },
    { id: 'vedic_period', name: 'Vedic Period' },
    { id: 'mahajanapadas', name: 'Mahajanapadas' },
    { id: 'maurya', name: 'Maurya Empire' },
    { id: 'gupta', name: 'Gupta Empire' },
    { id: 'chola', name: 'Chola Empire' },
    { id: 'delhi_sultanate', name: 'Delhi Sultanate' },
    { id: 'vijayanagara', name: 'Vijayanagara Empire' },
    { id: 'mughal', name: 'Mughal Empire' },
    { id: 'british_raj', name: 'British Raj' },
    { id: 'republic_of_india', name: 'Republic of India' }
  ];
  
  const base = '/images/Maps/';
  const exts = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
  
  async function findImage(id) {
    const candidates = [
      id,
      id.replace(/_/g, ''),
      id.replace(/_/g, '') + 'empire',
      id.replace(/_/g, '') + 'period'
    ];
    
    for (const c of candidates) {
      for (const e of exts) {
        const url = base + c + e;
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) return url;
        } catch (err) { /* continue */ }
        
        // Try capitalized version
        const capUrl = base + c.charAt(0).toUpperCase() + c.slice(1) + e;
        try {
          const res = await fetch(capUrl, { method: 'HEAD' });
          if (res.ok) return capUrl;
        } catch (err) { /* continue */ }
      }
    }
    return null;
  }
  
  for (const empire of EMPIRES) {
    const url = await findImage(empire.id);
    if (url) {
      console.log(`✅ ${empire.name} (${empire.id})\n   → ${url}`);
    } else {
      console.log(`❌ ${empire.name} (${empire.id})\n   → No image found (will show placeholder)`);
    }
  }
  
  console.log('\n✨ Image detection test complete!');
})();

// =====================================================
// TEST 2: Force Display Maurya Empire (-300 BCE)
// =====================================================
// Dispatches a year event to show Maurya Empire preview

console.log('\n📅 Testing Maurya Empire at year -300...');
window.dispatchEvent(new CustomEvent('timeline:year', { detail: -300 }));
console.log('→ Check for toast notification and right-side preview panel');

// =====================================================
// TEST 3: Test Multi-Empire Overlap (Mughal + Vijayanagara)
// =====================================================
// Year 1526 should show both empires with cycling controls

setTimeout(() => {
  console.log('\n📅 Testing overlap: Mughal + Vijayanagara at year 1526...');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: 1526 }));
  console.log('→ Toast should list both empires');
  console.log('→ Preview panel should show prev/next arrows');
}, 4000);

// =====================================================
// TEST 4: Test British Raj (1900 CE)
// =====================================================
setTimeout(() => {
  console.log('\n📅 Testing British Raj at year 1900...');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: 1900 }));
  console.log('→ Should show British Raj image');
}, 8000);

// =====================================================
// TEST 5: Test Modern Era - No Image (1950 CE)
// =====================================================
setTimeout(() => {
  console.log('\n📅 Testing Modern Era at year 1950...');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: 1950 }));
  console.log('→ Toast should show "Republic of India"');
  console.log('→ Preview panel should NOT appear (intentional)');
}, 12000);

// =====================================================
// TEST 6: Test Ancient Era Marker (-2000 BCE)
// =====================================================
setTimeout(() => {
  console.log('\n📅 Testing Ancient era at year -2000...');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: -2000 }));
  console.log('→ "Ancient" era marker should be highlighted');
}, 16000);

// =====================================================
// UTILITY: Manual Year Dispatch
// =====================================================
// Use this to manually test any year:
// dispatchYear(-300)  // Maurya
// dispatchYear(1600)  // Mughal + Vijayanagara
// dispatchYear(2025)  // Modern

window.dispatchYear = function(year) {
  console.log(`📅 Dispatching year: ${year}`);
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: year }));
};

console.log('\n💡 TIP: Use dispatchYear(year) to test any year manually');
console.log('   Examples:');
console.log('   - dispatchYear(-300)  → Maurya Empire');
console.log('   - dispatchYear(1600)  → Mughal + Vijayanagara');
console.log('   - dispatchYear(1900)  → British Raj');
console.log('   - dispatchYear(2025)  → Modern (no image)');
