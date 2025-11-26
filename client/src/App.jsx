// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import './App.css';
import MapView from './components/MapView';
import EnhancedSidebar from './components/EnhancedSidebar';
import Timeline from './components/Timeline';
import DetailsPanel from './components/DetailsPanel';
import PlanTripModal from './components/PlanTripModal';
import UploadStoryForm from './components/UploadStoryForm';
import { auth } from './firebase';
import AuthForm from './components/AuthForm';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [focusedPlace, setFocusedPlace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPlanTripOpen, setPlanTripOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeEpic, setActiveEpic] = useState(null);
  const [activeYear, setActiveYear] = useState(2025);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Fetching heritage sites data...');
    fetch('/api/data', { cache: 'no-cache' })
      .then(r => r.json())
      .then(d => {
        console.log('Raw API response:', d);
        const dataArray = Array.isArray(d) ? d : (d && d.items) ? d.items : [];
        
        // Transform relative image URLs to absolute backend URLs
        const transformed = dataArray.map(item => ({
          ...item,
          image_url: item.image_url && !item.image_url.startsWith('http')
            ? `http://localhost:4000/${item.image_url}`
            : item.image_url
        }));
        
        console.log(`Successfully loaded ${transformed.length} heritage sites`);
        console.log('Sample transformed item:', transformed[0]);
        setPlaces(transformed);
        setFiltered(transformed);
      })
      .catch(err => {
        console.error('Failed to load data', err);
        alert('Error loading heritage sites data. Please check that the backend server is running on http://localhost:4000');
      })
      .finally(() => setLoading(false));

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Filter logic
  useEffect(() => {
    if (!places.length) return;

    let result = places;

    // Category filter
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Epic filter
    if (activeEpic) {
      result = result.filter(p => p.epic === activeEpic);
    }

    // Year filter
    if (activeYear) {
      result = result.filter(p => !p.year || Number(p.year) <= Number(activeYear));
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p => {
        const hay = `${p.name} ${p.info || ''} ${p.details || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    setFiltered(result);
  }, [places, activeCategory, activeEpic, activeYear, searchQuery]);

  const handleFilterChange = ({ category, epic }) => {
    setActiveCategory(category);
    setActiveEpic(epic);
  };

  const handleYearChange = (year) => {
    setActiveYear(year);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Called by MapView when user clicks *inside the popup*
  const handleSelectPlace = (place) => {
    console.log('handleSelectPlace called —', place && place.name);
    setSelectedPlace(place || null);
    // When drawer opens, clear focus
    if (place) setFocusedPlace(null);
  };

  const handleCloseDetails = () => setSelectedPlace(null);

  const handleFocusPlace = (place) => {
    setFocusedPlace(place || null);
  };

  const openPlanTrip = () => setPlanTripOpen(true);
  const openUploadStory = () => setUploadOpen(true);

  const closeModals = () => {
    setPlanTripOpen(false);
    setUploadOpen(false);
  };

  if (!user) {
    return <AuthForm />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div>Loading heritage map…</div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Top controls */}
      <div className="top-controls">
        <button 
          className={`hamburger ${sidebarExpanded ? 'open' : ''}`}
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Sidebar */}
      <EnhancedSidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onFilterChange={handleFilterChange}
        activeCategory={activeCategory}
        activeEpic={activeEpic}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView 
          places={filtered} 
          onSelectPlace={handleSelectPlace} 
          focusedPlace={focusedPlace} 
          selectedPlace={selectedPlace} 
        />
      </div>

      {/* Timeline */}
      <Timeline 
        year={activeYear}
        onYearChange={handleYearChange}
        minYear={-500}
        maxYear={2025}
      />

      {/* Details Panel */}
      <DetailsPanel 
        place={selectedPlace} 
        onClose={handleCloseDetails} 
        onOpenTrip={openPlanTrip}
        onOpenUpload={openUploadStory}
      />

      {/* Modals */}
      <PlanTripModal
        place={selectedPlace}
        isOpen={isPlanTripOpen}
        onClose={closeModals}
      />

      <UploadStoryForm
        place={selectedPlace}
        isOpen={isUploadOpen}
        onClose={closeModals}
      />

      {/* Logout button */}
      {user && (
        <button
          className="logout-btn"
          onClick={() => signOut(auth)}
          title="Sign out"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      )}
    </div>
  );
}
