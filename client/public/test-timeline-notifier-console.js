// ============================================
// TIMELINE NOTIFIER DEBUG & TEST SCRIPT
// ============================================
// Copy and paste this entire script into your Browser DevTools Console (F12)
// and press Enter to run all tests

console.clear();
console.log('%c========================================', 'color: #4CAF50; font-weight: bold; font-size: 14px');
console.log('%c TIMELINE NOTIFIER TEST SUITE', 'color: #4CAF50; font-weight: bold; font-size: 16px');
console.log('%c========================================', 'color: #4CAF50; font-weight: bold; font-size: 14px');

// TEST 1: Check if component DOM elements exist
console.log('\n%c[TEST 1] DOM Element Check', 'color: #2196F3; font-weight: bold; font-size: 14px');
const hasToast = !!document.querySelector('.timeline-toast');
const hasPreview = !!document.querySelector('.timeline-preview');
const hasRail = !!document.querySelector('.timeline-rail');

console.log('toast:', hasToast);
console.log('preview:', hasPreview);
console.log('rail:', hasRail);

if (hasToast && hasPreview && hasRail) {
  console.log('%c✅ All DOM elements found - Component is MOUNTED', 'color: #4CAF50; font-weight: bold');
} else {
  console.log('%c❌ Missing DOM elements - Component NOT MOUNTED', 'color: #f44336; font-weight: bold');
  console.log('%cPlease ensure TimelineNotifierPanel is added to App.jsx', 'color: #FF9800');
}

// TEST 2: Check if CSS is loaded
console.log('\n%c[TEST 2] CSS Check', 'color: #2196F3; font-weight: bold; font-size: 14px');
const rail = document.querySelector('.timeline-rail');
if (rail) {
  const styles = window.getComputedStyle(rail);
  console.log('Rail position:', styles.position);
  console.log('Rail z-index:', styles.zIndex);
  console.log('Rail bottom:', styles.bottom);
  if (styles.position === 'absolute' && parseInt(styles.zIndex) >= 4000) {
    console.log('%c✅ CSS is properly loaded', 'color: #4CAF50; font-weight: bold');
  } else {
    console.log('%c⚠️ CSS may not be loaded correctly', 'color: #FF9800; font-weight: bold');
  }
}

// TEST 3: Manual event dispatch test
console.log('\n%c[TEST 3] Manual Event Test (Watch for UI changes!)', 'color: #2196F3; font-weight: bold; font-size: 14px');
console.log('Dispatching test events...');

// Test Maurya Empire (-300 BCE)
setTimeout(() => {
  console.log('%c→ Testing Maurya Empire (year -300)', 'color: #9C27B0; font-weight: bold');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: -300 }));
  console.log('  Expected: Toast shows "Maurya Empire" + right-side preview with image');
}, 500);

// Test Mughal + Vijayanagara overlap (1526 CE)
setTimeout(() => {
  console.log('%c→ Testing Mughal + Vijayanagara overlap (year 1526)', 'color: #9C27B0; font-weight: bold');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: 1526 }));
  console.log('  Expected: Toast shows both empires + cycling controls visible');
}, 5000);

// Test British Raj (1900 CE)
setTimeout(() => {
  console.log('%c→ Testing British Raj (year 1900)', 'color: #9C27B0; font-weight: bold');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: 1900 }));
  console.log('  Expected: Toast shows "British Raj" + right-side preview');
}, 9500);

// Test Modern Era - No Image (1950 CE)
setTimeout(() => {
  console.log('%c→ Testing Modern Era (year 1950)', 'color: #9C27B0; font-weight: bold');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: 1950 }));
  console.log('  Expected: Toast shows "Republic of India" but NO preview panel (by design)');
}, 14000);

// TEST 4: Force visibility test
console.log('\n%c[TEST 4] Force Visibility Test', 'color: #2196F3; font-weight: bold; font-size: 14px');
setTimeout(() => {
  const preview = document.querySelector('.timeline-preview');
  const toast = document.querySelector('.timeline-toast');
  
  if (preview) {
    preview.style.opacity = '1';
    preview.style.transform = 'translateX(0)';
    preview.style.pointerEvents = 'auto';
    preview.classList.add('show');
    preview.classList.remove('hide');
    console.log('%c✅ Preview panel forced visible', 'color: #4CAF50; font-weight: bold');
  } else {
    console.log('%c❌ Preview panel not found in DOM', 'color: #f44336; font-weight: bold');
  }
  
  if (toast) {
    toast.classList.add('show');
    console.log('%c✅ Toast forced visible', 'color: #4CAF50; font-weight: bold');
  } else {
    console.log('%c❌ Toast not found in DOM', 'color: #f44336; font-weight: bold');
  }
  
  console.log('%cIf UI appears now, CSS/visibility was the issue', 'color: #FF9800');
}, 18000);

// TEST 5: Check for console errors
console.log('\n%c[TEST 5] Listening for React/Component Errors...', 'color: #2196F3; font-weight: bold; font-size: 14px');
console.log('Watch for any red error messages in console.');

// TEST 6: Era markers test
setTimeout(() => {
  console.log('\n%c[TEST 6] Era Markers Check', 'color: #2196F3; font-weight: bold; font-size: 14px');
  const markers = document.querySelectorAll('.era-marker');
  console.log(`Found ${markers.length} era markers (expected: 5)`);
  if (markers.length === 5) {
    console.log('%c✅ All 5 era markers found:', 'color: #4CAF50; font-weight: bold');
    markers.forEach(m => {
      const label = m.querySelector('.era-label');
      if (label) console.log('  -', label.textContent);
    });
  } else {
    console.log('%c⚠️ Expected 5 era markers, found:', markers.length, 'color: #FF9800; font-weight: bold');
  }
}, 20000);

// Helper function for manual testing
window.testYear = function(year) {
  console.log(`%c[MANUAL TEST] Dispatching year: ${year}`, 'color: #E91E63; font-weight: bold; font-size: 14px');
  window.dispatchEvent(new CustomEvent('timeline:year', { detail: year }));
};

console.log('\n%c========================================', 'color: #4CAF50; font-weight: bold; font-size: 14px');
console.log('%c TESTS RUNNING - Watch for UI changes!', 'color: #4CAF50; font-weight: bold; font-size: 14px');
console.log('%c========================================', 'color: #4CAF50; font-weight: bold; font-size: 14px');
console.log('\n%c💡 TIP: Use testYear(year) to manually test any year', 'color: #2196F3; font-size: 12px');
console.log('%c   Examples:', 'color: #2196F3; font-size: 12px');
console.log('%c   - testYear(-300)  → Maurya Empire', 'color: #9E9E9E; font-size: 11px');
console.log('%c   - testYear(1600)  → Mughal + Vijayanagara', 'color: #9E9E9E; font-size: 11px');
console.log('%c   - testYear(1900)  → British Raj', 'color: #9E9E9E; font-size: 11px');
console.log('%c   - testYear(2025)  → Modern (no image)', 'color: #9E9E9E; font-size: 11px');
