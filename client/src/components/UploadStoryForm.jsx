// client/src/components/UploadStoryForm.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { apiUrl } from '../apiBase';

export default function UploadStoryForm({ place, isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFile = (e) => setFile(e.target.files?.[0] || null);

  const handleUpload = async (e) => {
    e && e.preventDefault();
    if (!file) return alert('Please choose a file.');
    if (!auth.currentUser) return alert('Please sign in first.');

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const fd = new FormData();
      fd.append('image', file);
      fd.append('placeId', place?.id || place?.placeId || place?.name || '');
      fd.append('caption', caption || '');

      const resp = await fetch(apiUrl('/api/upload-story'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const data = await resp.json();
      if (!resp.ok) throw data;
      alert('Upload successful');
      setFile(null);
      setCaption('');
      if (onClose) onClose();
    } catch (err) {
      console.error('upload error', err);
      alert('Upload failed: ' + (err?.error || err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Upload Story for {place?.name}</h2>
        <form onSubmit={handleUpload} style={{ padding: 8 }}>
          <input type="file" accept="image/*" onChange={handleFile} disabled={loading} />
          <div>
            <input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Caption (optional)" disabled={loading} />
          </div>
          <div style={{ marginTop: 10 }}>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading…' : 'Upload'}</button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
