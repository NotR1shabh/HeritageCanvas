// client/src/components/Sidebar.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { apiUrl } from '../apiBase';

export function useUserTrips() {
  const [trips, setTrips] = useState([]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!auth.currentUser) return setTrips([]);
      try {
        const token = await auth.currentUser.getIdToken();
        const resp = await fetch(apiUrl('/api/trips'), { headers: { Authorization: `Bearer ${token}` }});
        const data = await resp.json();
        if (resp.ok && mounted) setTrips(data.trips || []);
      } catch (e) {
        console.error('fetch trips failed', e);
      }
    };
    load();
    const unsub = auth.onAuthStateChanged(() => load());
    return () => { mounted = false; unsub && unsub(); };
  }, []);
  return trips;
}

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function Sidebar({ places, onFilterChange, onFocusPlace }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [yearUpper, setYearUpper] = useState(2025);

  // Compute min/max from data
  useEffect(() => {
    if (!places || places.length === 0) return;
    const years = places.map(p => p.year || 0).filter(Boolean);
    if (years.length === 0) return;
    const max = Math.max(...years);
    setYearUpper(max);
  }, [places]);

  const notify = useMemo(
    () => debounce((q, cat, yr) => onFilterChange({ query: q, category: cat, yearUpper: yr, maxYear: yr }), 300),
    [onFilterChange]
  );

  useEffect(() => {
    notify(query, category, yearUpper);
  }, [query, category, yearUpper, notify]);

  const categories = useMemo(() => {
    const set = new Set();
    (places || []).forEach(p => p.category && set.add(p.category));
    return ['all', ...Array.from(set).sort()];
  }, [places]);

  return (
    <aside style={{ width: 320, padding: 16, boxSizing: 'border-box', height: '100vh', overflowY: 'auto', background: '#fff', borderRight: '1px solid #eee' }}>
      <h2>Heritage Canvas</h2>
      <div style={{ margin: '12px 0' }}>
        <input
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          placeholder="Search places, descriptions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#333' }}>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: category === cat ? '2px solid #2b7cff' : '1px solid #ddd',
                background: category === cat ? '#eef6ff' : '#fff',
                cursor: 'pointer'
              }}
            >
              {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <label style={{ fontSize: 13 }}>Year ≤ {yearUpper}</label>
        <div style={{ marginTop: 8 }}>
          <input
            type="range"
            min={1700}
            max={2025}
            value={yearUpper}
            onChange={(e) => setYearUpper(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <strong>{(places || []).length}</strong> places total
      </div>

      {/* User Trips */}
      <TripsSection />

      {/* Places List */}
      <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8, color: '#666' }}>Places</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '40vh', overflowY: 'auto' }}>
          {(places || []).slice(0, 50).map((p, idx) => (
            <li key={`${p.name}-${idx}`} style={{ marginBottom: 4 }}>
              <button
                onClick={() => onFocusPlace && onFocusPlace(p)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid #eee',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#f5f7fb')}
                onMouseLeave={(e) => (e.target.style.background = '#fff')}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function TripsSection() {
  const trips = useUserTrips();
  if (!auth.currentUser) return (
    <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>Sign in to view your trips.</div>
  );
  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 14, marginBottom: 6 }}>Your Trips</h3>
      {trips.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>No trips yet.</div>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {trips.map(t => (
          <li key={t.id} style={{ marginBottom: 4, fontSize: 12 }}>
            • {t.title || 'Untitled'}
          </li>
        ))}
      </ul>
    </div>
  );
}
