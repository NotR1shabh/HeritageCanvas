import React, { useState } from 'react';
import { auth } from '../firebase';

export default function PlanTripModal({ place, isOpen, onClose }) {
  const [tripTitle, setTripTitle] = useState('');
  const [tripItems, setTripItems] = useState([]); // placeholder for itinerary entries
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!auth.currentUser) { alert('Sign in first'); return; }
    const token = await auth.currentUser.getIdToken();
    setSaving(true);
    try {
      const resp = await fetch('http://localhost:4000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: tripTitle || place?.name || 'Untitled Trip', items: tripItems })
      });
      const data = await resp.json();
      if (!resp.ok) throw data;
      alert('Trip saved');
      setTripTitle('');
      setTripItems([]);
    } catch (err) {
      console.error('save trip error', err);
      alert('Failed to save trip: ' + (err?.error || err?.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Plan a Trip to {place?.name}</h2>

        <label>Trip Title:</label>
        <input value={tripTitle} onChange={(e)=>setTripTitle(e.target.value)} placeholder="Trip title" />

        <div style={{ marginTop: '15px', textAlign: 'right' }}>
          <button className="btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Trip'}</button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
