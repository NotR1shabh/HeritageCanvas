import React from 'react';

export default function Timeline({ year, onYearChange, minYear = -500, maxYear = 2025 }) {
  return (
    <div className="timeline">
      <input
        id="yearRange"
        type="range"
        min={minYear}
        max={maxYear}
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        aria-label="Filter by year"
      />
      <div className="year" id="yearLabel">{year}</div>
    </div>
  );
}
