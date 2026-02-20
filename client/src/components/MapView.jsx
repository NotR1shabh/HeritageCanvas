// client/src/components/MapView.jsx
import React, { useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CustomZoom from './CustomZoom';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const CATEGORY_ICON_OVERRIDES = {
  // The asset in client/public/filters is capitalized; Vite dev server will fall back to index.html
  // for missing static assets, which makes the marker icon effectively invisible.
  tales_and_epics: '/filters/Tales_and_epics.png'
};

const getIconForCategory = (category) => {
  if (!category) return new L.Icon.Default();
  const key = String(category).trim();
  const safeName = key.replace(/\s+/g, '_');
  const url = CATEGORY_ICON_OVERRIDES[key] || `/filters/${safeName}.png`;
  return L.icon({
    iconUrl: url,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function MapView({ places, center = [20.5937, 78.9629], zoom = 5, onSelectPlace, focusedPlace, selectedPlace, theme = 'light' }) {
  const items = useMemo(() => places || [], [places]);
  const markerRefs = useRef({});
  const markerLayerRef = useRef(null);

  // Clean up marker refs when items change
  useEffect(() => {
    return () => {
      markerRefs.current = {};
    };
  }, [items]);

  const tileUrl = theme === 'dark'
    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div id="map-root" style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} key={theme}>
        <TileLayer
          url={tileUrl}
          attribution='© OpenStreetMap contributors, © CARTO'
        />
        <MapController 
          focusedPlace={focusedPlace} 
          selectedPlace={selectedPlace} 
          markerRefs={markerRefs}
          markerLayerRef={markerLayerRef}
          items={items}
        />
        {items.map((p, i) => {
          const pos = Array.isArray(p.coords) && p.coords.length >= 2 ? [p.coords[0], p.coords[1]] : null;
          if (!pos) return null;
          const icon = getIconForCategory(p.category);
          const markerId = `${p.name}-${i}`;
          const summary = p.brief || p.info || p.description;
          const popupFacts = Array.isArray(p.quickFacts) ? p.quickFacts.slice(0, 2) : [];
          return (
            <Marker 
              key={markerId} 
              position={pos} 
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current[markerId] = ref;
              }}
            >
              <Popup minWidth={240}>
                {/* Important: clicking inside this container triggers onSelectPlace */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectPlace) onSelectPlace(p);
                  }}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                >
                  {p.image_url && (
                    <img
                      src={`${String(p.image_url).startsWith('/') ? p.image_url : '/' + p.image_url}`}
                      alt={p.name}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }}
                    />
                  )}
                  <h3 style={{ margin: '8px 0' }}>{p.name}</h3>
                  {summary && <div style={{ fontSize: 13 }}>{summary}</div>}
                  {popupFacts.length > 0 && (
                    <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: 12, color: 'var(--muted-text)' }}>
                      {popupFacts.map(({ label, value }) => (
                        <li key={`${p.name}-${label}`}>{label}: {value}</li>
                      ))}
                    </ul>
                  )}
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted-text)' }}>Year: {p.year || 'N/A'}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent)' }}><strong>Click here for details →</strong></div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <CustomZoom />
      </MapContainer>
    </div>
  );
}

// Helper component to control map behavior
function MapController({ focusedPlace, selectedPlace, markerRefs, markerLayerRef, items }) {
  const map = useMap();

  // Auto-fit bounds when items change
  useEffect(() => {
    if (!items || items.length === 0) return;

    const markerLayer = L.featureGroup();
    markerLayerRef.current = markerLayer;

    items.forEach(p => {
      const pos = Array.isArray(p.coords) && p.coords.length >= 2 ? [p.coords[0], p.coords[1]] : null;
      if (pos) {
        L.marker(pos).addTo(markerLayer);
      }
    });

    if (markerLayer.getLayers().length) {
      const bounds = markerLayer.getBounds();
      map.fitBounds(bounds.pad(0.15), { animate: true, maxZoom: 10 });
    } else {
      map.setView([20.5937, 78.9629], 5);
    }

    setTimeout(() => map.invalidateSize(), 350);
  }, [items, map, markerLayerRef]);

  // When selectedPlace changes (drawer opens), close any open popup
  useEffect(() => {
    if (selectedPlace) {
      map.closePopup();
    }
  }, [selectedPlace, map]);

  // When focusedPlace changes, pan to it and open its popup
  useEffect(() => {
    if (!focusedPlace) return;

    const pos = Array.isArray(focusedPlace.coords) && focusedPlace.coords.length >= 2 
      ? [focusedPlace.coords[0], focusedPlace.coords[1]] 
      : null;
    
    if (!pos) return;

    // Pan to the place
    map.setView(pos, 8, { animate: true });

    // Find and open the marker's popup
    setTimeout(() => {
      const markerId = Object.keys(markerRefs.current).find(id => id.startsWith(focusedPlace.name));
      if (markerId && markerRefs.current[markerId]) {
        markerRefs.current[markerId].openPopup();
      }
    }, 400); // Small delay to allow map animation to complete
  }, [focusedPlace, map, markerRefs]);

  return null;
}
