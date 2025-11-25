// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
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

  const onFilterChange = ({ query, category, maxYear }) => {
    if (!places) return;
    const q = (query || '').trim().toLowerCase();

    const result = places.filter(p => {
      if (category && category !== 'all' && p.category !== category) return false;
      if (p.year && p.year > (maxYear || Infinity)) return false;
      if (q) {
        const hay = `${p.name} ${p.info || ''} ${p.details || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    setFiltered(result);
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {user && (
        <button
          onClick={() => signOut(auth)}
          style={{
            position: 'absolute',
            right: 20,
            top: 15,
            zIndex: 3000,
            padding: '6px 10px',
            background: '#222',
            color: '#fff',
            borderRadius: 6,
            border: 'none'
          }}
        >
          Logout
        </button>
      )}
      <Sidebar places={places} onFilterChange={onFilterChange} onFocusPlace={handleFocusPlace} />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView places={filtered} onSelectPlace={handleSelectPlace} focusedPlace={focusedPlace} selectedPlace={selectedPlace} />
      </div>
      <DetailsPanel 
        place={selectedPlace} 
        onClose={handleCloseDetails} 
        onOpenTrip={openPlanTrip}
        onOpenUpload={openUploadStory}
      />

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
    </div>
  );
}
