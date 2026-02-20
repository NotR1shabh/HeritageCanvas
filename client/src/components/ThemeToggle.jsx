// client/src/components/ThemeToggle.jsx
import React from 'react';
import './ThemeToggle.css';

export default function ThemeToggle({ theme, onToggle, className = '', showLabel = false }) {
  return (
    <button 
      className={`theme-toggle ${className}`.trim()}
      onClick={onToggle}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
      {showLabel && <span className="theme-toggle__label">Theme</span>}
    </button>
  );
}
