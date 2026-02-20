# Timeline Notifier Integration Checklist

## ✅ Files Created
- [x] `client/src/hooks/useTimelineNotifier.js`
- [x] `client/src/components/TimelineNotifierPanel.jsx`
- [x] `client/src/styles/timeline-notifier.css`
- [x] `client/scripts/normalize-map-names.js` (optional helper)
- [x] `client/scripts/test-timeline-notifier.js` (browser console tests)

## 📋 Integration Steps

### Step 1: Verify Images
- [ ] Check that images exist in `client/public/images/Maps/`
- [ ] Run filename normalizer (optional): `node client/scripts/normalize-map-names.js`
- [ ] Ensure filenames match empire IDs (case-insensitive):
  - `maurya` → MauryaEmpire.JPG ✓
  - `mughal` → MughalEmpire.JPG ✓
  - `vijayanagara` → Vijayanagar.JPG ✓
  - `gupta` → GuptaEmpire.JPG ✓
  - `chola` → CholaEmpire.JPG ✓
  - `delhi_sultanate` → DelhiSultanate.JPG ✓
  - `british_raj` → BritishRaj.JPG ✓
  - `vedic_period` → vedicperiod.JPG ✓
  - `indus_valley` → indusvalleycivilisation.JPG ✓

### Step 2: Choose Integration Mode

**Option A: Prop Mode (Recommended)**
```jsx
// In your Timeline page or App.jsx
import TimelineNotifierPanel from './components/TimelineNotifierPanel';

function YourPage() {
  const [year, setYear] = useState(2025);
  
  return (
    <>
      <MapView ... />
      <TimelineNotifierPanel year={year} />
      <TimelineSlider 
        value={year} 
        onChange={setYear}
        onYearChange={setYear}
      />
    </>
  );
}
```

**Option B: Event Mode**
```jsx
// If your slider dispatches events, add this in your slider code:
window.dispatchEvent(new CustomEvent('timeline:year', { detail: year }));

// Then just add the component (it will auto-listen):
<TimelineNotifierPanel />
```

### Step 3: Test in Browser

1. **Start dev server**: `npm run dev` (from client directory)
2. **Open browser DevTools Console**
3. **Copy/paste test script**: See `client/scripts/test-timeline-notifier.js`
4. **Run image detection test**: First test in the script will show which images are detected
5. **Test manual year dispatch**: Use `dispatchYear(-300)` in console

### Step 4: Verify Functionality

Test these scenarios by moving the timeline slider:

- [ ] **Year -300**: Maurya Empire toast + image appears
- [ ] **Year 1526**: Both Mughal + Vijayanagara shown, can cycle between
- [ ] **Year 1600**: Medieval era marker active
- [ ] **Year 1900**: British Raj image shown
- [ ] **Year 1950**: Modern era, NO image panel (by design)
- [ ] **Era markers**: Click markers to dispatch jump events
- [ ] **Toast auto-hide**: Toast disappears after 3.5 seconds
- [ ] **Smooth transitions**: No flickering during rapid slider movement

## 🐛 Troubleshooting

### Preview panel never shows
- ✓ Verify `TimelineNotifierPanel` is mounted in DOM
- ✓ Check if `year` prop is passed OR events are dispatched
- ✓ Test with: `window.dispatchEvent(new CustomEvent('timeline:year', { detail: -300 }))`

### Placeholder shown instead of image
- ✓ Run image detection test (see test script)
- ✓ Check browser Network tab for 404 errors
- ✓ Verify image filenames contain empire ID substring
- ✓ Run `node client/scripts/normalize-map-names.js` to fix names

### Toast overlaps other UI
- ✓ Adjust `.timeline-toast` bottom position in CSS
- ✓ Current: `bottom: 34px` - increase if needed

### Preview panel overlaps map controls
- ✓ Adjust `.timeline-preview` right position or z-index in CSS
- ✓ Current z-index: `4500` - lower if needed to go under other controls

### Era markers not visible
- ✓ Check `.timeline-rail` bottom position in CSS
- ✓ Current: `bottom: 120px` - adjust for your slider position
- ✓ Verify slider doesn't hide the rail

### Debouncing too slow/fast
- ✓ Change debounce delay in `TimelineNotifierPanel.jsx` line ~205
- ✓ Current: 200ms - adjust as needed

## 📝 Notes

- **Modern era**: `republic_of_india` intentionally shows NO image
- **Image extensions**: Tries .png, .jpg, .jpeg (case-insensitive)
- **Debounce**: 200ms delay prevents flicker during rapid slider movement
- **Toast duration**: 3500ms (3.5 seconds) before auto-hide
- **Era range**: -2500 BCE to 2025 CE
- **Local only**: No remote image fetching, all from `/images/Maps/`

## 🎨 Customization

### Change accent color
```css
/* In timeline-notifier.css, add at top: */
:root {
  --accent: #6c63ff; /* Change this color */
}
```

### Adjust toast position
```css
.timeline-toast {
  bottom: 34px; /* Change this value */
}
```

### Adjust preview panel size
```css
.timeline-preview {
  width: 340px; /* Change width */
  top: 120px; /* Change top position */
}
```

### Change transitions speed
```css
.timeline-toast {
  transition: opacity 0.18s ease, transform 0.22s ease;
  /* Adjust timing values */
}
```

## ✨ Done!

Your timeline notifier should now be fully integrated and working. Test thoroughly and adjust CSS as needed for your layout.
