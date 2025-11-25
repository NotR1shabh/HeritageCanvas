// client/src/components/UploadStoryForm.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';

export default function UploadStoryForm({ placeId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

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
      fd.append('placeId', placeId || '');
      fd.append('caption', caption || '');

      const resp = await fetch('http://localhost:4000/api/upload-story', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const data = await resp.json();
      if (!resp.ok) throw data;
      alert('Upload successful');
      if (onUploaded) onUploaded(data.story);
      setFile(null);
      setCaption('');
    } catch (err) {
      console.error('upload error', err);
      alert('Upload failed: ' + (err?.error || err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} style={{ padding: 8 }}>
      <input type="file" accept="image/*" onChange={handleFile} disabled={loading} />
      <div>
        <input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Caption (optional)" disabled={loading} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Upload Story'}</button>
      </div>
    </form>
  );
}
