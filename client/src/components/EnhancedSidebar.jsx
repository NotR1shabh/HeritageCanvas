import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const FILTERS = [
  { id: 'all', icon: 'fa-globe-asia', label: 'All' },
  { id: 'tales_and_epics', icon: 'fa-book-open', label: 'Tales & Epics', isEpic: true },
  { id: 'monuments_and_architecture', icon: 'fa-landmark', label: 'Monuments & Architecture' },
  { id: 'folk_arts_and_handcrafts', icon: 'fa-palette', label: 'Folk arts & Handicrafts' },
  { id: 'cuisine', icon: 'fa-utensils', label: 'Cuisine' },
  { id: 'music_and_dance', icon: 'fa-music', label: 'Music & Dance' },
  { id: 'festivals_and_traditions', icon: 'fa-calendar-alt', label: 'Festivals & Traditions' },
  { id: 'spiritual_and_pilgrimage', icon: 'fa-praying-hands', label: 'Spiritual & Pilgrimage' },
  { id: 'nature_and_wildlife', icon: 'fa-leaf', label: 'Nature & Wildlife' },
];

const EPIC_SUBFILTERS = [
  { id: 'ramayan', icon: 'fa-scroll', label: 'Ramayan' },
  { id: 'harivamsa', icon: 'fa-om', label: 'Harivamsa' },
  { id: 'mahabharat', icon: 'fa-chess-knight', label: 'Mahabharat' },
];

export default function EnhancedSidebar({ 
  expanded, 
  onToggle, 
  onFilterChange,
  activeCategory,
  activeEpic,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  user,
  onLoginClick,
  onLogoutClick
}) {
  const [showEpicSubfilters, setShowEpicSubfilters] = useState(false);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'tales_and_epics') {
      setShowEpicSubfilters(!showEpicSubfilters);
      onFilterChange({ category: categoryId, epic: null });
    } else {
      setShowEpicSubfilters(false);
      onFilterChange({ category: categoryId, epic: null });
    }
  };

  const handleEpicClick = (epicId) => {
    onFilterChange({ category: 'tales_and_epics', epic: epicId });
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-full">Heritage Canvas</span>
          <span className="logo-short">HC</span>
        </div>
      </div>

      <div className="search-bar" role="search">
        <i className="fas fa-search" aria-hidden="true"></i>
        <input
          className="search-input"
          type="text"
          placeholder="Search places, info, details..."
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-btn"
            onClick={handleClearSearch}
            title="Clear search"
            aria-label="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <nav className="filters">
        {FILTERS.map((filter) => (
          <React.Fragment key={filter.id}>
            <button
              className={`filter-btn category-button ${filter.isEpic ? 'epic-filter-btn' : ''} ${
                activeCategory === filter.id ? 'active' : ''
              }`}
              onClick={() => handleCategoryClick(filter.id)}
              title={filter.label}
            >
              <i className={`fas ${filter.icon}`}></i>
              <span className="btn-text">{filter.label}</span>
            </button>

            {filter.isEpic && showEpicSubfilters && (
              <div className="epic-subfilters open">
                {EPIC_SUBFILTERS.map((epic) => (
                  <button
                    key={epic.id}
                    className={`subfilter-btn category-button ${activeEpic === epic.id ? 'active' : ''}`}
                    onClick={() => handleEpicClick(epic.id)}
                    title={epic.label}
                  >
                    <i className={`fas ${epic.icon}`}></i>
                    <span className="btn-text">{epic.label}</span>
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-actions">
          <ThemeToggle
            theme={theme}
            onToggle={onToggleTheme}
            className="sidebar-footer-btn sidebar-theme-btn"
            showLabel={expanded}
          />

          <button
            className={`sidebar-auth-btn sidebar-footer-btn ${user ? 'logout' : 'login'}`}
            onClick={user ? onLogoutClick : onLoginClick}
            title={user ? 'Sign out' : 'Sign in'}
          >
            <i className={`fas ${user ? 'fa-sign-out-alt' : 'fa-sign-in-alt'}`}></i>
            <span>{user ? 'Logout' : 'Login'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
