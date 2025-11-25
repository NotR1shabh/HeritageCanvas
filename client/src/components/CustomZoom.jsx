import React from 'react';
import { useMap } from 'react-leaflet';

export default function CustomZoom() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="custom-zoom">
      <button 
        className="zoom-btn" 
        onClick={handleZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <i className="fas fa-plus"></i>
      </button>
      <button 
        className="zoom-btn" 
        onClick={handleZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <i className="fas fa-minus"></i>
      </button>
    </div>
  );
}
