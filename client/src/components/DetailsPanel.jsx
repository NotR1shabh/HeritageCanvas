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
      className={`details-sidebar ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button className="close-btn" onClick={() => onClose && onClose()} aria-label="Close details">×</button>

      {place ? (
        <div className="details-content">
          {place.image_url && <img src={place.image_url} alt={place.name} id="detailsImage" />}
          <h2 id="detailsName">{place.name}</h2>
          <div className="details-meta">
            <div><strong>Category:</strong> {place.category || 'N/A'}</div>
            <div id="detailsYear"><strong>Year:</strong> {place.year || 'N/A'}</div>
          </div>
          {place.info && <p id="detailsInfo" style={{ fontStyle: 'italic', color: '#333', marginBottom: '20px', borderLeft: '3px solid var(--accent)', paddingLeft: '15px' }}>{place.info}</p>}
          {place.details && <div id="detailsText" style={{ fontSize: '1rem', lineHeight: '1.7', color: '#444', whiteSpace: 'pre-wrap' }}>{place.details}</div>}

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onOpenTrip()} style={{ flex: '1 1 auto', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: '600', transition: 'transform 0.2s' }}>
              Plan Trip
            </button>
            <button onClick={() => onOpenUpload()} style={{ flex: '1 1 auto', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2c3e50', color: 'white', cursor: 'pointer', fontWeight: '600', transition: 'transform 0.2s' }}>
              Upload Story
            </button>
          </div>
          {stories.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>Community Stories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stories.map(st => (
                  <div key={st.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                    {st.imageUrl && <img src={st.imageUrl} alt={st.caption} style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }} />}
                    <div style={{ fontSize: '13px', color: '#333' }}>{st.caption || 'Untitled'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="details-content">
          <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>Select a heritage site to view details</div>
        </div>
      )}
    </aside>
  );
}
