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

const getIconForCategory = (category) => {
  if (!category) return new L.Icon.Default();
  const safeName = category.replace(/\s+/g, '_');
  const url = `/filters/${safeName}.png`;
  return L.icon({
    iconUrl: url,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function MapView({ places, center = [20.5937, 78.9629], zoom = 5, onSelectPlace, focusedPlace, selectedPlace }) {
  const items = useMemo(() => places || [], [places]);
  const markerRefs = useRef({});
  const markerLayerRef = useRef(null);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
                      src={p.image_url}
                      alt={p.name}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }}
                    />
                  )}
                  <h3 style={{ margin: '8px 0' }}>{p.name}</h3>
                  <div style={{ fontSize: 13 }}>{p.info}</div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>Year: {p.year}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#2b7cff' }}><strong>Click here for details →</strong></div>
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

      // Demo popup animation for first 3 markers
      const demoMarkers = markerLayer.getLayers().slice(0, 3);
      demoMarkers.forEach((m, idx) => {
        setTimeout(() => {
          m.openPopup();
          setTimeout(() => m.closePopup(), 1400);
        }, idx * 600);
      });
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
