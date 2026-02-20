import React, { useMemo } from 'react';
import { ERA_MARKERS } from '../hooks/useTimelineNotifier';

const formatYearLabel = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (n === 0) return '0 CE';
  return n < 0 ? `${Math.abs(n)} BCE` : `${n} CE`;
};

const getEraForYear = (value) => {
  if (value == null || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  return ERA_MARKERS.find((era) => n >= era.start && n <= era.end) || null;
};

export default function Timeline({ year, onYearChange, minYear = -500, maxYear = 2025 }) {
  const handleYearChange = (newYear) => {
    onYearChange(newYear);
    // Dispatch global event for TimelineNotifierPanel
    window.dispatchEvent(new CustomEvent('timeline:year', { detail: newYear }));
  };

  const currentEra = useMemo(() => getEraForYear(year), [year]);
  const formattedYear = formatYearLabel(year);
  const eraRange = currentEra ? `${formatYearLabel(currentEra.start)} – ${formatYearLabel(currentEra.end)}` : null;

  return (
    <div id="timeline" className="timeline">
      <div className="timeline-era" aria-live="polite">
        <span className="timeline-era__title">{currentEra ? `${currentEra.label} Era` : 'Outside Defined Eras'}</span>
        {eraRange && <span className="timeline-era__range">{eraRange}</span>}
      </div>
      <input
        id="yearRange"
        type="range"
        min={minYear}
        max={maxYear}
        value={year}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        aria-label="Filter by year"
      />
      <div className="year" id="yearLabel">{formattedYear}</div>
    </div>
  );
}
