// Hook: compute visible empires / era / era markers based on year
// 
// Integration: Pass a numeric year prop from parent component
// Example: const { visible, era, eraMarkers } = useTimelineNotifier(currentYear);
// Or listen to 'timeline:year' events dispatched globally and pass the event.detail as year
//
// BCE years use negative numbers (e.g., -300 for 300 BCE)

import { useMemo } from 'react';
import { EMPIRE_METADATA } from '../config';

export const ERA_MARKERS = [
  { id: 'ancient', label: 'Ancient', start: -2500, end: -500, short: 'Ancient' },
  { id: 'classical', label: 'Classical', start: -500, end: 1200, short: 'Classical' },
  { id: 'medieval', label: 'Medieval', start: 1200, end: 1757, short: 'Medieval' },
  { id: 'colonial', label: 'Colonial', start: 1757, end: 1947, short: 'Colonial' },
  { id: 'modern', label: 'Modern', start: 1947, end: 2025, short: 'Modern' }
];

/**
 * Get all empires visible in the given year
 * @param {number} year - The year to check (negative for BCE)
 * @param {Array} metas - Array of empire metadata objects (default: EMPIRE_METADATA from config)
 * @returns {Array} Array of empire metadata objects visible in the given year
 */
export function getVisibleEmpiresForYear(year, metas = EMPIRE_METADATA) {
  if (year == null) return [];
  const n = Number(year);
  return metas.filter(m => Number(m.startYear) <= n && Number(m.endYear) >= n);
}

/**
 * Hook to compute visible empires and era information for a given year
 * @param {number} year - The current year (negative for BCE)
 * @returns {Object} Object containing: year, visible (array of empires), era (current era object), eraMarkers (all era markers)
 */
export default function useTimelineNotifier(year) {
  const visible = useMemo(() => getVisibleEmpiresForYear(year), [year]);
  
  const era = useMemo(() => {
    if (year == null) return null;
    const n = Number(year);
    return ERA_MARKERS.find(e => n >= e.start && n <= e.end) || null;
  }, [year]);

  return { year, visible, era, eraMarkers: ERA_MARKERS };
}

/**
 * Get candidate image filenames for an empire
 * Generates possible filename patterns to search for in /images/Maps/
 * @param {Object} empire - Empire metadata object with id and name
 * @returns {Array} Array of candidate filename patterns (without extension)
 */
export function getImageCandidates(empire) {
  if (!empire) return [];
  
  const candidates = [];
  const id = empire.id || '';
  const name = empire.name || '';
  
  // Remove common words and format name variations
  const cleanName = name
    .replace(/\s+(Empire|Period|Civilization|Sultanate|Raj)\s*$/i, '')
    .replace(/\s+/g, '');
  
  // Add id-based candidates
  if (id) {
    candidates.push(id); // e.g., 'maurya'
    candidates.push(id.replace(/_/g, '')); // e.g., 'indusvalley' from 'indus_valley'
    candidates.push(id.replace(/_/g, '') + 'empire'); // e.g., 'mauryaempire'
    candidates.push(id.replace(/_/g, '') + 'period'); // e.g., 'vedicperiod'
  }
  
  // Add name-based candidates
  if (cleanName) {
    candidates.push(cleanName.toLowerCase()); // e.g., 'maurya'
    candidates.push(cleanName.toLowerCase() + 'empire'); // e.g., 'mauryaempire'
  }
  
  return [...new Set(candidates)]; // Remove duplicates
}
