// Timeline Notifier Panel Component
// 
// ========================================
// INTEGRATION INSTRUCTIONS
// ========================================
//
// OPTION 1: Pass year prop from parent (recommended)
// -------------------------------------------------
// In your Timeline page or App.jsx:
//
//   import TimelineNotifierPanel from './components/TimelineNotifierPanel';
//   
//   function YourPage() {
//     const [year, setYear] = useState(2025);
//     
//     return (
//       <>
//         <MapView ... />
//         <TimelineNotifierPanel year={year} />
//         <TimelineSlider value={year} onChange={setYear} />
//       </>
//     );
//   }
//
// OPTION 2: Listen to global 'timeline:year' events
// --------------------------------------------------
// If TimelineSlider dispatches window events instead:
//
//   function TimelineBridge() {
//     const [year, setYear] = useState(null);
//     useEffect(() => {
//       const handler = (e) => setYear(e.detail);
//       window.addEventListener('timeline:year', handler);
//       return () => window.removeEventListener('timeline:year', handler);
//     }, []);
//     return <TimelineNotifierPanel year={year} />;
//   }
//
// ========================================
// IMAGE NAMING CONVENTIONS
// ========================================
//
// Place map images in: client/public/images/Maps/
//
// Filename patterns (case-insensitive matching):
//   - Match empire id: 'maurya' -> MauryaEmpire.JPG, maurya.png
//   - Match empire name: 'Maurya Empire' -> MauryaEmpire.JPG
//   - Examples from your directory:
//     * MauryaEmpire.JPG (for id: 'maurya')
//     * MughalEmpire.JPG (for id: 'mughal')
//     * Vijayanagar.JPG (for id: 'vijayanagara')
//     * GuptaEmpire.JPG (for id: 'gupta')
//     * CholaEmpire.JPG (for id: 'chola')
//     * DelhiSultanate.JPG (for id: 'delhi_sultanate')
//     * BritishRaj.JPG (for id: 'british_raj')
//     * vedicperiod.JPG (for id: 'vedic_period')
//     * indusvalleycivilisation.JPG (for id: 'indus_valley')
//
// Note: Modern era (republic_of_india) intentionally shows NO image
//
// ========================================
// FEATURES
// ========================================
// - Shows era markers on timeline rail (Ancient, Classical, Medieval, Colonial, Modern)
// - Displays transient toast when empires become visible (auto-hides after 3500ms)
// - Shows right-side preview panel with empire map images from local public directory
// - Supports cycling through multiple active empires
// - Debounces year changes (200ms) to prevent flicker
// - Fully accessible with ARIA attributes
// - Uses local images only (no remote fetching)

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import useTimelineNotifier, { getImageCandidates } from '../hooks/useTimelineNotifier';
import '../styles/timeline-notifier.css';

// Base path for map images (stored in client/public/images/Maps/)
const MAP_IMAGE_BASE = '/images/Maps';

// Actual image filenames in the Maps directory (exact names from file system)
const ACTUAL_IMAGE_FILES = [
  'BritishRaj.jpg',
  'CholaEmpire.jpg',
  'DelhiSultanate.jpg',
  'GuptaEmpire.jpg',
  'indusvalleycivilisation.jpg',
  'MauryaEmpire.jpg',
  'MughalEmpire.jpg',
  'vedicperiod.jpg',
  'Vijayanagar&Mughal.jpg',
  'Vijayanagar.jpg'
];

/**
 * Find matching image filename for an empire by scanning actual files
 * @param {Object} empire - Empire metadata object
 * @returns {string|null} Matched filename or null
 */
function findImageFilename(empire) {
  if (!empire) return null;
  
  const candidates = getImageCandidates(empire);
  console.log(`[findImageFilename] Empire: ${empire.id} "${empire.name}"`);
  console.log(`[findImageFilename] Candidates:`, JSON.stringify(candidates));
  
  // Try to match against actual files (case-insensitive)
  for (const candidate of candidates) {
    const lowerCandidate = candidate.toLowerCase();
    
    for (const actualFile of ACTUAL_IMAGE_FILES) {
      const lowerFile = actualFile.toLowerCase();
      const fileWithoutExt = lowerFile.replace(/\.(jpg|jpeg|png)$/i, '');
      
      // Check if file contains candidate or vice versa
      if (fileWithoutExt.includes(lowerCandidate) || lowerCandidate.includes(fileWithoutExt)) {
        console.log(`[findImageFilename] ✓ MATCH! Candidate "${candidate}" matches file "${actualFile}"`);
        // Return the actual filename (with correct casing)
        return actualFile;
      }
    }
  }
  
  console.log(`[findImageFilename] ✗ No match found for empire: ${empire.id}`);
  return null;
}

/**
 * Generate candidate image URLs for an empire
 * Tries multiple filename patterns and extensions
 */
function getCandidateImageUrls(empire) {
  if (!empire) return [];
  
  const matchedFile = findImageFilename(empire);
  if (matchedFile) {
    // Return the actual file URL
    return [`${MAP_IMAGE_BASE}/${matchedFile}`];
  }
  
  // Fallback: try common patterns
  const id = empire.id || '';
  const name = empire.name || '';
  const simplifiedId = id.replace(/_/g, '');
  const simplifiedName = name.replace(/\s+/g, '').replace(/Empire|Period|Civilization/gi, '');
  
  return [
    // Try with empire suffix
    `${MAP_IMAGE_BASE}/${simplifiedName}Empire.jpg`,
    `${MAP_IMAGE_BASE}/${simplifiedName}.jpg`,
    `${MAP_IMAGE_BASE}/${simplifiedId}.jpg`,
    `${MAP_IMAGE_BASE}/${simplifiedId}empire.jpg`,
    // Try lowercase
    `${MAP_IMAGE_BASE}/${simplifiedName.toLowerCase()}.jpg`,
    `${MAP_IMAGE_BASE}/${simplifiedId.toLowerCase()}.jpg`,
    // Try with different extensions
    `${MAP_IMAGE_BASE}/${simplifiedName}.png`,
    `${MAP_IMAGE_BASE}/${simplifiedId}.png`,
    `${MAP_IMAGE_BASE}/${simplifiedName}.jpeg`,
    `${MAP_IMAGE_BASE}/${simplifiedId}.jpeg`
  ];
}

/**
 * Main Timeline Notifier Panel Component
 * @param {number} year - Current year (negative for BCE, null/undefined if not set)
 * @param {number} autoHideMs - Duration before toast auto-hides (default: 3500ms)
 */
export default function TimelineNotifierPanel({ year: yearProp, autoHideMs = 3500 }) {
  const [eventYear, setEventYear] = useState(null);
  const [debouncedYear, setDebouncedYear] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Use prop year if provided, otherwise listen to global events
  const year = yearProp !== undefined ? yearProp : eventYear;
  
  const { visible, era, eraMarkers } = useTimelineNotifier(year);

  // Debug log for testing
  useEffect(() => {
    console.log('TimelineNotifierPanel mounted, year prop=', yearProp, 'effective year=', year);
  }, [yearProp, year]);

  // Listen to global timeline:year events if no prop provided
  useEffect(() => {
    if (yearProp !== undefined) return; // Prop takes precedence
    
    const handler = (e) => {
      console.log('TimelineNotifier: Received timeline:year event with value:', e.detail);
      setEventYear(e.detail);
    };
    window.addEventListener('timeline:year', handler);
    return () => window.removeEventListener('timeline:year', handler);
  }, [yearProp]);

  // Debounce year updates (200ms) to prevent flicker during rapid changes
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedYear(year), 200);
    return () => clearTimeout(timer);
  }, [year]);

  // When visible empires change, show toast and reset selection
  useEffect(() => {
    if (!visible || visible.length === 0) {
      setToast(null);
      return;
    }
    setSelectedIndex(0);
    setToast({ metas: visible });
    
    // Auto-hide toast after specified duration
    const timer = setTimeout(() => setToast(null), autoHideMs);
    return () => clearTimeout(timer);
  }, [visible, autoHideMs]);

  // Cycle to next empire in the visible list
  const cycleNext = useCallback(() => {
    if (!visible || visible.length === 0) return;
    setSelectedIndex(i => (i + 1) % visible.length);
  }, [visible]);

  // Cycle to previous empire in the visible list
  const cyclePrev = useCallback(() => {
    if (!visible || visible.length === 0) return;
    setSelectedIndex(i => (i - 1 + visible.length) % visible.length);
  }, [visible]);

  const selectedMeta = visible && visible.length > 0 ? visible[selectedIndex] : null;

  // Get candidate image URLs for selected empire (memoized to prevent unnecessary re-renders)
  const imageUrls = useMemo(() => {
    return selectedMeta ? getCandidateImageUrls(selectedMeta) : [];
  }, [selectedMeta]);

  // Don't show image for modern republic_of_india
  const shouldHideImage = selectedMeta && selectedMeta.id === 'republic_of_india';
  
  // Log image search for debugging
  useEffect(() => {
    if (selectedMeta && !shouldHideImage) {
      const filename = findImageFilename(selectedMeta);
      const urls = getCandidateImageUrls(selectedMeta);
      console.log(`[TimelineNotifier] Empire: ${selectedMeta.id} (${selectedMeta.name})`);
      console.log(`[TimelineNotifier] Matched file: ${filename || 'none'}`);
      console.log(`[TimelineNotifier] Trying URLs:`, urls);
      if (!filename) {
        console.warn(`[TimelineNotifier] No matching image file found for empire: ${selectedMeta.id}`);
      }
    }
  }, [selectedMeta, shouldHideImage]);

  return (
    <>
      {/* Era rail with subtle markers across timeline */}
      <div className="timeline-rail" role="presentation" aria-label="Timeline era markers">
        {eraMarkers.map(marker => {
          const totalMin = -2500;
          const totalMax = 2025;
          const totalRange = totalMax - totalMin;
          
          // Calculate position as percentage along the rail
          const pos = ((marker.start - totalMin) / totalRange) * 100;
          const active = debouncedYear != null && 
                        Number(debouncedYear) >= marker.start && 
                        Number(debouncedYear) <= marker.end;
          
          return (
            <button
              key={marker.id}
              className={`era-marker ${active ? 'active' : ''}`}
              style={{ left: `${pos}%` }}
              aria-pressed={active}
              aria-label={`${marker.label} era (${marker.start} to ${marker.end})`}
              onClick={() => {
                // Dispatch event for parent components to listen and jump to era
                window.dispatchEvent(
                  new CustomEvent('timeline:jumpToEra', { detail: marker })
                );
              }}
            >
              <span className="era-label">{marker.short}</span>
            </button>
          );
        })}
      </div>

      <div className="timeline-side-stack" aria-live="polite">
        {/* Transient toast notification for visible empires */}
        <div 
          className={`timeline-toast ${toast ? 'show' : ''}`} 
          role="status" 
          aria-live="polite"
          aria-atomic="true"
        >
          {toast && toast.metas && (
            <>
              <div className="toast-title">In this period</div>
              <div className="toast-body">
                {toast.metas.map(m => (
                  <div key={m.id} className="toast-item">
                    <span 
                      className="swatch" 
                      style={{ background: m.displayColor || '#666' }}
                      aria-hidden="true"
                    />
                    <div className="meta">
                      <div className="name">{m.name}</div>
                      <div className="dates">
                        {m.startYear} — {m.endYear}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right-side preview panel with empire map */}
        <aside 
          className={`timeline-preview ${selectedMeta && !shouldHideImage ? 'show' : 'hide'}`} 
          aria-hidden={!selectedMeta || shouldHideImage}
          aria-label="Empire map preview"
        >
        {selectedMeta && !shouldHideImage ? (
          <>
            <div className="preview-header">
              <div className="preview-title">{selectedMeta.name}</div>
              <div className="preview-dates">
                {selectedMeta.startYear} — {selectedMeta.endYear}
              </div>
            </div>

            <div className="preview-body">
              <div className="preview-image-wrap">
                <ImageWithFallback 
                  urls={imageUrls} 
                  alt={`Map of ${selectedMeta.name}`}
                />
              </div>

              {/* If multiple empires active, show cycle controls */}
              {visible && visible.length > 1 && (
                <div className="preview-controls">
                  <button 
                    className="ctrl" 
                    onClick={cyclePrev} 
                    aria-label="Previous empire"
                    tabIndex={0}
                  >
                    ◀
                  </button>
                  <div className="preview-list">
                    {visible.map((v, idx) => (
                      <button
                        key={v.id}
                        className={`preview-list-item ${idx === selectedIndex ? 'selected' : ''}`}
                        onClick={() => setSelectedIndex(idx)}
                        aria-label={`View ${v.name}`}
                        aria-pressed={idx === selectedIndex}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="ctrl" 
                    onClick={cycleNext} 
                    aria-label="Next empire"
                    tabIndex={0}
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="preview-empty" aria-live="polite">
            No era map available
          </div>
        )}
        </aside>
      </div>
    </>
  );
}

/**
 * Helper component: tries multiple image URLs in order, shows first successful
 * Falls back to placeholder if none load
 * Uses img onError for fallback instead of HEAD requests (more reliable with dev servers)
 */
function ImageWithFallback({ urls = [], alt = '' }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  // Convert URLs array to a stable string key for comparison
  const urlsKey = urls.join('|');

  useEffect(() => {
    // Reset state when URLs change
    console.log('[ImageWithFallback] URLs changed:', urls);
    setCurrentUrlIndex(0);
    setFailed(false);
    setLoading(true);
  }, [urlsKey]);

  const handleError = useCallback(() => {
    const currentUrl = urls[currentUrlIndex];
    console.log(`[ImageWithFallback] Failed to load: ${currentUrl}`);
    // Try next URL
    if (currentUrlIndex < urls.length - 1) {
      console.log(`[ImageWithFallback] Trying next URL (${currentUrlIndex + 1}/${urls.length})`);
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      // All URLs failed
      console.log('[ImageWithFallback] All URLs failed');
      setFailed(true);
      setLoading(false);
    }
  }, [currentUrlIndex, urls]);

  const handleLoad = useCallback(() => {
    const currentUrl = urls[currentUrlIndex];
    console.log(`[ImageWithFallback] Successfully loaded: ${currentUrl}`);
    setLoading(false);
    setFailed(false);
  }, [currentUrlIndex, urls]);

  if (!urls || urls.length === 0 || failed) {
    console.log('[ImageWithFallback] Showing placeholder - urls:', urls, 'failed:', failed);
    return (
      <div className="no-image" role="img" aria-label="Map not available">
        Map not available
      </div>
    );
  }

  const currentUrl = urls[currentUrlIndex];
  console.log('[ImageWithFallback] Current URL:', currentUrl, 'Index:', currentUrlIndex);

  return (
    <>
      {loading && (
        <div className="no-image loading" role="status" aria-live="polite">
          Loading map...
        </div>
      )}
      <img 
        key={currentUrl}
        ref={imgRef}
        className="preview-image" 
        src={currentUrl} 
        alt={alt}
        /* Remove lazy to ensure immediate load in Simple Browser */
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </>
  );
}
