// client/src/components/DetailsPanel.jsx
import React, { useEffect, useState } from 'react';
import Flashcards from './Flashcards';

async function loadPlaceStories(placeId) {
  if (!placeId) return [];
  const resp = await fetch(`/api/place-stories/${placeId}`);
  const data = await resp.json();
  if (resp.ok) return data.stories || [];
  console.error('place stories fetch failed', data);
  return [];
}

export default function DetailsPanel({ place, onClose, onOpenTrip, onOpenUpload, onOpenChatbot }) {
  const [stories, setStories] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
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
      if (!place) { 
        setStories([]);
        setShowFlashcards(false);
        return; 
      }
      const s = await loadPlaceStories(place.id || place.placeId || place.name);
      if (mounted) setStories(s);
    })();
    return () => { mounted = false; };
  }, [place]);

  const handleOpenFlashcards = () => {
    setShowFlashcards(true);
  };

  const handleCloseFlashcards = () => {
    setShowFlashcards(false);
  };

  const summaryText = place && (place.info || place.brief);
  const detailText = place && (place.description || place.details);
  const quickFacts = place && Array.isArray(place.quickFacts) ? place.quickFacts : [];

  return (
    <aside
      className={`details-sidebar ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button className="close-btn" onClick={() => onClose && onClose()} aria-label="Close details">×</button>

      {place ? (
        showFlashcards ? (
          <Flashcards epic={place.epic} onBack={handleCloseFlashcards} />
        ) : (
          <div className="details-content">
            {place.image_url && (
              <img 
                src={`${String(place.image_url).startsWith('/') ? place.image_url : '/' + place.image_url}`}
                alt={place.name}
                id="detailsImage"
              />
            )}
            <h2 id="detailsName">{place.name}</h2>
            <div className="details-meta">
              <div><strong>Category:</strong> {place.category || 'N/A'}</div>
              <div id="detailsYear"><strong>Year:</strong> {place.year || 'N/A'}</div>
            </div>
            {summaryText && (
              <p
                id="detailsInfo"
                style={{ fontStyle: 'italic', color: 'var(--text)', marginBottom: '20px', borderLeft: '3px solid var(--accent)', paddingLeft: '15px' }}
              >
                {summaryText}
              </p>
            )}
            {detailText && (
              <div
                id="detailsText"
                style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text)', whiteSpace: 'pre-wrap' }}
              >
                {detailText}
              </div>
            )}

            {quickFacts.length > 0 && (
              <div
                className="quick-facts"
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--glass)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Quick Facts</h3>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px' }}>
                  {quickFacts.map(({ label, value }) => (
                    <div key={`${label}-${value}`} style={{ borderBottom: '1px dotted rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                      <dt style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted-text)', marginBottom: '4px' }}>{label}</dt>
                      <dd style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: '.92rem', lineHeight: 1.4 }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => onOpenTrip()} style={{ flex: '1 1 auto', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: '600', transition: 'transform 0.2s' }}>
                Plan Trip
              </button>
              <button onClick={() => onOpenUpload()} style={{ flex: '1 1 auto', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--glass)', color: 'var(--text)', cursor: 'pointer', fontWeight: '600', transition: 'transform 0.2s' }}>
                Upload Story
              </button>
              <button onClick={() => {
                console.log('Ask Guide clicked', { place, onOpenChatbot });
                if (onOpenChatbot) {
                  onOpenChatbot(place);
                }
              }} style={{ flex: '1 1 auto', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', fontWeight: '600', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <i className="fas fa-comments"></i> Ask Guide
              </button>
            </div>

            {(place.epic === 'ramayan' || place.epic === 'harivamsa' || place.epic === 'mahabharat') && (
              <button 
                onClick={handleOpenFlashcards} 
                className="panel-toggle-btn"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '320px',
                  margin: '28px auto 8px',
                  justifyContent: 'center',
                  padding: '10px 20px', 
                  borderRadius: '999px', 
                  border: '2px solid rgba(255,255,255,0.25)', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  fontSize: '0.92rem',
                  letterSpacing: '.3px',
                  transition: 'transform .18s ease, box-shadow .25s ease',
                  boxShadow: '0 6px 18px rgba(118,75,162,0.35)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 10px 28px rgba(118,75,162,0.45)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 18px rgba(118,75,162,0.35)';
                }}
              >
                <span style={{ fontSize: '1rem', display: 'flex' }}>📖</span>
                <span>Explore {place.epic === 'ramayan' ? 'Ramayan' : place.epic === 'harivamsa' ? 'Harivamsa' : 'Mahabharata'} Flashcards</span>
              </button>
            )}

            {stories.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>Community Stories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stories.map(st => (
                    <div key={st.id} style={{ padding: '10px', background: 'var(--glass)', borderRadius: '8px' }}>
                      {st.imageUrl && <img src={st.imageUrl} alt={st.caption} style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }} />}
                      <div style={{ fontSize: '13px', color: 'var(--text)' }}>{st.caption || 'Untitled'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="details-content">
          <div style={{ color: 'var(--muted-text)', textAlign: 'center', padding: '40px 20px' }}>Select a heritage site to view details</div>
        </div>
      )}
    </aside>
  );
}
