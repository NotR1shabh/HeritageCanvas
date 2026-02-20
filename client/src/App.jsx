// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import './App.css';
import MapView from './components/MapView';
import EnhancedSidebar from './components/EnhancedSidebar';
import Timeline from './components/Timeline';
import TimelineNotifierPanel from './components/TimelineNotifierPanel';
import DetailsPanel from './components/DetailsPanel';
import PlanTripModal from './components/PlanTripModal';
import UploadStoryForm from './components/UploadStoryForm';
import { auth } from './firebase';
import AuthForm from './components/AuthForm';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ChatBot from './components/ChatBot';
import ChatLauncher from './components/ChatLauncher';
import ChatOverlay from './components/ChatOverlay';
import PERSONAS from './data/personas';
import './styles/timeline-notifier.css';

const QUICK_FACT_FIELDS = [
  ['Location', 'location'],
  ['Built By', 'builder'],
  ['Architecture', 'architectureType'],
  ['Materials', 'materials'],
  ['Key Features', 'keyFeatures'],
  ['Current Status', 'currentStatus'],
  ['Cultural Importance', 'culturalImportance'],
  ['Origin Region', 'originRegion'],
  ['Origin Period', 'originPeriod'],
  ['Religion', 'religion'],
  ['Cultural Group', 'culturalGroup'],
  ['Instruments', 'instruments'],
  ['Ingredients', 'ingredients'],
  ['Preparation Style', 'preparationStyle'],
  ['Human Interaction', 'humanInteractionType'],
  ['Species Involved', 'speciesInvolved'],
  ['Ecological Importance', 'ecologicalImportance'],
  ['Conservation Legacy', 'conservationLegacy']
];

const SKIP_DYNAMIC_KEYS = new Set([
  'name',
  'coords',
  'category',
  'year',
  'image_url',
  'imageUrl',
  'info',
  'details',
  'brief',
  'description',
  'epic',
  'placeId',
  'id',
  'createdAt',
  'updatedAt',
  'quickFacts',
  'stories',
  'location',
  'built by',
  'built_by',
  'builtBy',
  'created by',
  'architecture type',
  'architecture_type',
  'art style type',
  'style type',
  'style features',
  'style_features',
  'materials',
  'materials used',
  'materials_used',
  'key features',
  'key_features',
  'keyfeatures',
  'current status',
  'current_status',
  'cultural importance',
  'cultural_importance',
  'origin region',
  'origin_region',
  'origin period',
  'origin_period',
  'religion',
  'cultural group',
  'cultural_group',
  'human interaction type',
  'human_interaction_type',
  'species involved',
  'species_involved',
  'ecological importance',
  'ecological_importance',
  'conservation legacy',
  'conservation_legacy',
  'ingredients',
  'preparation style',
  'preparation_style',
  'instruments used',
  'instruments_used'
]);

const isMeaningful = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const pickField = (source, candidates) => {
  for (const key of candidates) {
    if (!key) continue;
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      if (isMeaningful(value)) return value;
    }
  }
  return undefined;
};

const formatLabel = (rawKey) => rawKey
  .replace(/[_-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (c) => c.toUpperCase());

const buildQuickFacts = (normalized, original) => {
  const facts = [];
  const seen = new Set();
  const addFact = (label, value) => {
    if (!isMeaningful(value) || seen.has(label)) return;
    facts.push({ label, value });
    seen.add(label);
  };

  QUICK_FACT_FIELDS.forEach(([label, key]) => addFact(label, normalized[key]));

  Object.entries(original).forEach(([rawKey, rawValue]) => {
    if (SKIP_DYNAMIC_KEYS.has(rawKey)) return;
    if (!isMeaningful(rawValue)) return;
    if (typeof rawValue === 'object') return;
    const label = formatLabel(rawKey);
    addFact(label, rawValue);
  });

  return facts;
};

const normalizePlace = (item) => {
  const normalized = { ...item };
  if (item.image_url) {
    normalized.image_url = item.image_url.startsWith('/') ? item.image_url : '/' + item.image_url;
  }

  const getField = (keys) => pickField(item, keys);

  normalized.brief = getField(['brief', 'info']);
  normalized.description = getField(['description', 'details', 'brief']);
  normalized.location = getField(['location']);
  normalized.builder = getField(['built by', 'built_by', 'builtBy', 'created by']);
  normalized.architectureType = getField(['architecture type', 'architecture_type', 'art style type', 'style type']);
  normalized.materials = getField(['materials', 'materials used', 'materials_used']);
  normalized.keyFeatures = getField(['key features', 'key_features', 'keyfeatures', 'style features', 'style_features']);
  normalized.currentStatus = getField(['current status', 'current_status']);
  normalized.culturalImportance = getField(['cultural importance', 'cultural_importance']);
  normalized.originRegion = getField(['origin region', 'origin_region']);
  normalized.originPeriod = getField(['origin period', 'origin_period']);
  normalized.religion = getField(['religion']);
  normalized.culturalGroup = getField(['cultural group', 'cultural_group']);
  normalized.humanInteractionType = getField(['human interaction type', 'human_interaction_type']);
  normalized.speciesInvolved = getField(['species involved', 'species_involved']);
  normalized.ecologicalImportance = getField(['ecological importance', 'ecological_importance']);
  normalized.conservationLegacy = getField(['conservation legacy', 'conservation_legacy']);
  normalized.ingredients = getField(['ingredients']);
  normalized.preparationStyle = getField(['preparation style', 'preparation_style']);
  normalized.instruments = getField(['instruments used', 'instruments_used']);

  normalized.quickFacts = buildQuickFacts(normalized, item);
  return normalized;
};

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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'trip' or 'story'
  const [isAuthFormOpen, setAuthFormOpen] = useState(false);
  const [chatbotPlace, setChatbotPlace] = useState(null); // Track which place chatbot is open for
  const [chatOverlayOpen, setChatOverlayOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('heritagecanvas_theme') : null;
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Debug chatbot state changes
  useEffect(() => {
    console.log('Chatbot place changed:', chatbotPlace);
  }, [chatbotPlace]);

  useEffect(() => {
    console.log('Fetching heritage sites data...');
    const url = `/api/data?ts=${Date.now()}`;
    fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        console.log('Raw API response:', d);
        const dataArray = Array.isArray(d) ? d : (d && d.items) ? d.items : [];
        const normalized = dataArray.map(normalizePlace);

        console.log(`Successfully loaded ${normalized.length} heritage sites`);
        console.log('Sample normalized item:', normalized[0]);
        setPlaces(normalized);
        setFiltered(normalized);
      })
      .catch(err => {
        console.error('Failed to load data', err);
        alert('Error loading heritage sites data. Please check that the backend server is running and reachable.');
      })
      .finally(() => setLoading(false));

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Apply theme class to <html> and persist
  useEffect(() => {
    const root = document.documentElement; // <html>
    if (theme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    localStorage.setItem('heritagecanvas_theme', theme);
  }, [theme]);

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
        const factsText = Array.isArray(p.quickFacts)
          ? p.quickFacts.map(({ label, value }) => `${label} ${value || ''}`).join(' ')
          : '';
        const hay = [
          p.name,
          p.brief,
          p.description,
          p.location,
          p.builder,
          p.architectureType,
          factsText
        ].filter(Boolean).join(' ').toLowerCase();
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

  const openPlanTrip = () => {
    if (!user) {
      setPendingAction('trip');
      setShowAuthPrompt(true);
    } else {
      setPlanTripOpen(true);
    }
  };

  const openUploadStory = () => {
    if (!user) {
      setPendingAction('story');
      setShowAuthPrompt(true);
    } else {
      setUploadOpen(true);
    }
  };

  const closeModals = () => {
    setPlanTripOpen(false);
    setUploadOpen(false);
    setShowAuthPrompt(false);
    setAuthFormOpen(false);
  };

  const handleLoginSuccess = () => {
    setAuthFormOpen(false);
    setShowAuthPrompt(false);
    // Auto-open the intended action after login
    if (pendingAction === 'trip') {
      setPlanTripOpen(true);
    } else if (pendingAction === 'story') {
      setUploadOpen(true);
    }
    setPendingAction(null);
  };

  const openAuthForm = () => {
    setShowAuthPrompt(false);
    setAuthFormOpen(true);
  };

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
        {/* Chat Launcher */}
        <ChatLauncher onOpen={() => {
          const currentCategory = activeCategory !== 'all' ? activeCategory : 'default';
          const persona = PERSONAS[currentCategory] || PERSONAS.default;
          setChatbotPlace({ ...selectedPlace, category: currentCategory });
          setChatOverlayOpen(true);
        }} />
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
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        user={user}
        onLoginClick={() => setAuthFormOpen(true)}
        onLogoutClick={() => signOut(auth)}
      />

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView 
          places={filtered} 
          onSelectPlace={handleSelectPlace} 
          focusedPlace={focusedPlace} 
          selectedPlace={selectedPlace} 
          theme={theme}
        />
      </div>

      {/* Timeline */}
      <Timeline 
        year={activeYear}
        onYearChange={handleYearChange}
        minYear={-500}
        maxYear={2025}
      />

      {/* Timeline Notifier Panel */}
      <TimelineNotifierPanel year={activeYear} />

      {/* Details Panel */}
      <DetailsPanel 
        place={selectedPlace} 
        onClose={handleCloseDetails} 
        onOpenTrip={openPlanTrip}
        onOpenUpload={openUploadStory}
        onOpenChatbot={(place) => {
          setChatbotPlace(place);
          setChatOverlayOpen(true);
        }}
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

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="modal-overlay" onClick={() => setShowAuthPrompt(false)}>
          <div className="modal-box auth-prompt-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>
              <i className="fas fa-lock" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>
              Login Required
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--muted-text)', marginBottom: '24px', lineHeight: '1.6' }}>
              Please login to {pendingAction === 'trip' ? 'plan your trip' : 'upload your story'}.
              <br />Create an account or sign in to continue.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={openAuthForm}>
                <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                Login Now
              </button>
              <button className="btn-secondary" onClick={() => setShowAuthPrompt(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Form Modal */}
      {isAuthFormOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-box auth-form-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button 
              className="close-btn" 
              onClick={closeModals}
              style={{ position: 'absolute', top: '10px', right: '10px' }}
            >
              ×
            </button>
            <AuthForm onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* ChatBot - Original inline chatbot */}
      {chatbotPlace && !chatOverlayOpen && (
        <ChatBot
          place={chatbotPlace}
          category={chatbotPlace.category || 'default'}
          onClose={() => setChatbotPlace(null)}
        />
      )}

      {/* ChatOverlay - New overlay-based chat system */}
      <ChatOverlay
        open={chatOverlayOpen}
        onClose={() => {
          setChatOverlayOpen(false);
          setChatbotPlace(null);
        }}
        selectedCharacter={chatbotPlace ? (PERSONAS[chatbotPlace.category] || PERSONAS.default) : PERSONAS.default}
        selectedItem={chatbotPlace}
      />
    </div>
  );
}
