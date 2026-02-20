// client/src/components/ChatOverlay.jsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ChatPanel from './ChatPanel';
import './ChatOverlay.css';

export default function ChatOverlay({ open, onClose, selectedCharacter, selectedItem }) {
  const [mapRect, setMapRect] = useState(null);
  const dockRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(420);

  useEffect(() => {
    const mapEl = document.getElementById('map-root');
    if (!mapEl) return;
    const update = () => setMapRect(mapEl.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(mapEl);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open]);

  // Measure the chat panel height so we can align its bottom to the timeline bottom.
  useEffect(() => {
    if (!open) return;

    const panelEl = dockRef.current?.querySelector('.chat-panel-root');
    if (!panelEl) return;

    const measure = () => {
      const rect = panelEl.getBoundingClientRect();
      if (rect && rect.height) setPanelHeight(rect.height);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panelEl);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [open, selectedCharacter, selectedItem]);

  useEffect(() => {
    const map = document.getElementById('map-root');
    if (!map) return;
    if (open) map.classList.add('map-blurred');
    else map.classList.remove('map-blurred');
    return () => map.classList.remove('map-blurred');
  }, [open]);

  if (!open || !mapRect) return null;

  // Find timeline element to align chat bottom to timeline bottom
  const timelineEl = document.getElementById('timeline') || document.querySelector('.timeline-slider') || document.querySelector('.timeline');
  const timelineRect = timelineEl ? timelineEl.getBoundingClientRect() : null;
  const mapTopAbs = mapRect.top + window.scrollY;
  const mapBottomAbs = mapTopAbs + mapRect.height;

  // Bottom edge we want to align to: timeline bottom border (or map bottom fallback)
  const timelineBottomAbs = timelineRect ? (timelineRect.bottom + window.scrollY) : (mapBottomAbs - 12);

  // Compute top so the chat panel bottom exactly overlaps the timeline bottom.
  // Clamp so we never place it above the map top.
  const desiredTop = timelineBottomAbs - panelHeight;
  const dockTop = Math.max(desiredTop, mapTopAbs + 8);

  // dock width centered and responsive, but avoid overlapping side panels
  const mapLeft = mapRect.left + window.scrollX;
  const mapRight = mapRect.left + window.scrollX + mapRect.width;

  let usableLeft = mapLeft;
  let usableRight = mapRight;

  const leftSidebarEl = document.querySelector('.sidebar');
  if (leftSidebarEl) {
    const leftRect = leftSidebarEl.getBoundingClientRect();
    usableLeft = Math.max(usableLeft, leftRect.right + window.scrollX + 12);
  }

  const detailsSidebarEl = document.querySelector('.details-sidebar.open');
  if (detailsSidebarEl) {
    const detailsRect = detailsSidebarEl.getBoundingClientRect();
    usableRight = Math.min(usableRight, detailsRect.left + window.scrollX - 12);
  }

  const usableWidth = Math.max(0, usableRight - usableLeft);
  let dockWidth = Math.min(940, Math.max(320, Math.floor(usableWidth * 0.92)));
  dockWidth = Math.min(dockWidth, usableWidth);
  const dockLeft = usableLeft + Math.max(0, (usableWidth - dockWidth) / 2);

  const backdropStyle = {
    position: 'absolute',
    left: `${mapLeft}px`,
    top: `${mapRect.top + window.scrollY}px`,
    width: `${mapRect.width}px`,
    height: `${mapRect.height}px`,
    zIndex: 1250,
  };

  const dockStyle = {
    position: 'absolute',
    left: `${dockLeft}px`,
    top: `${dockTop}px`,
    width: `${dockWidth}px`,
    zIndex: 1260,
  };

  return ReactDOM.createPortal(
    <>
      <div className="chat-overlay-backdrop" style={backdropStyle} onClick={onClose} />
        <div className="chat-dock" style={dockStyle} ref={dockRef}>
        <ChatPanel initialCharacter={selectedCharacter} initialItem={selectedItem} onClose={onClose} />
      </div>
    </>,
    document.body
  );
}
