// client/src/components/DetailsPanel.jsx
import React, { useEffect, useState } from 'react';

async function loadPlaceStories(placeId) {
  if (!placeId) return [];
  const resp = await fetch(`http://localhost:4000/api/place-stories/${placeId}`);
  const data = await resp.json();
  if (resp.ok) return data.stories || [];
  console.error('place stories fetch failed', data);
  return [];
}

export default function DetailsPanel({ place, onClose, onOpenTrip, onOpenUpload }) {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isOpen = !!place;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!place) { setStories([]); return; }
      const s = await loadPlaceStories(place.id || place.placeId || place.name);
      if (mounted) setStories(s);
    })();
    return () => { mounted = false; };
  }, [place]);

  return (
    <aside
      className={`details-drawer ${isOpen ? 'open' : 'closed'}`}
      aria-hidden={!isOpen}
    >
      <div className="drawer-header">
        <button className="drawer-close" onClick={() => onClose && onClose()} aria-label="Close details">✕</button>
      </div>

      {place ? (
        <div className="drawer-body">
          <h2>{place.name}</h2>
          {place.image_url && <img src={place.image_url} alt={place.name} className="drawer-image" />}
          <p style={{ whiteSpace: 'pre-wrap' }}>{place.details || place.info}</p>
          <div className="drawer-meta">
            <div><strong>Category:</strong> {place.category}</div>
            <div><strong>Year:</strong> {place.year}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={() => onOpenTrip()}>
              Plan Trip
            </button>
            <button style={{ marginLeft: 8 }} onClick={() => onOpenUpload()}>
              Upload Story
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 6 }}>Stories</h3>
            {stories.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>No stories yet.</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {stories.map(st => (
                <li key={st.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12 }}><strong>{st.caption || 'Untitled'}</strong></div>
                  {st.imageUrl && <img src={st.imageUrl} alt={st.caption} style={{ maxWidth: '100%', borderRadius: 4, marginTop: 4 }} />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="drawer-body">
          <div style={{ color: '#666' }}>No place selected</div>
        </div>
      )}
    </aside>
  );
}
