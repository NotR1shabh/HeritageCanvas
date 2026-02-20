// server/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
console.log('GOOGLE_API_KEY present?', !!process.env.GOOGLE_API_KEY);
const { admin, db, bucket } = require('./firebaseAdmin');
const qualityCheck = require('./hooks/qualityCheck');
const { v4: uuidv4 } = require('uuid');
const { getPersonaForCategory } = require('./personas');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

const IS_PROD = process.env.NODE_ENV === 'production';
const CLIENT_PUBLIC_DIR = path.join(__dirname, '..', 'client', 'public');
const CLIENT_DIST_DIR = path.join(__dirname, '..', 'client', 'dist');
const LEGACY_PUBLIC_DIR = path.join(__dirname, 'legacy-public');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({ dest: UPLOADS_DIR });

async function verifyToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: 'missing-auth' });
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('verifyIdToken failed', err);
    return res.status(401).json({ error: 'invalid-token', detail: err.message });
  }
}

app.post('/api/trips', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const payload = req.body || {};
    const id = uuidv4();
    const docRef = db.collection('users').doc(uid).collection('trips').doc(id);
    await docRef.set({ ...payload, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.json({ id });
  } catch (err) {
    console.error('trips.create error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

app.get('/api/trips', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db.collection('users').doc(uid).collection('trips').orderBy('createdAt', 'desc').get();
    const trips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ trips });
  } catch (err) {
    console.error('trips.list error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

app.post('/api/upload-story', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const uid = req.user.uid;
    const file = req.file;
    const { placeId = null, caption = '' } = req.body || {};

    if (!file) return res.status(400).json({ error: 'no_file' });

    const qc = await qualityCheck(file.path);
    if (!qc.ok) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(400).json({ error: 'quality_failed', reason: qc.reason });
    }

    const destName = `stories/${Date.now()}_${file.originalname}`;
    await bucket.upload(file.path, {
      destination: destName,
      metadata: {
        contentType: file.mimetype || 'image/jpeg',
        metadata: { firebaseStorageDownloadTokens: uuidv4() }
      }
    });

    const fileRef = bucket.file(destName);
    const [meta] = await fileRef.getMetadata();
    const token = (meta.metadata && meta.metadata.firebaseStorageDownloadTokens) || '';
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${meta.bucket}/o/${encodeURIComponent(meta.name)}?alt=media&token=${token}`;

    const storyId = uuidv4();
    const storyDoc = {
      id: storyId,
      placeId,
      caption,
      imageUrl: downloadURL,
      storagePath: meta.name,
      ownerUid: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const batch = db.batch();
    if (placeId) {
      const pRef = db.collection('places').doc(placeId).collection('stories').doc(storyId);
      batch.set(pRef, storyDoc);
    }
    const uRef = db.collection('users').doc(uid).collection('stories').doc(storyId);
    batch.set(uRef, storyDoc);
    await batch.commit();

    try { fs.unlinkSync(file.path); } catch (e) {}

    return res.json({ story: storyDoc });
  } catch (err) {
    console.error('upload-story error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

// Serve data.json for heritage sites
app.get('/api/data', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  if (fs.existsSync(dataPath)) {
    // Ensure clients don't cache dataset changes during development.
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(dataPath);
  }
  return res.status(404).json({ error: 'data_not_found' });
});

// Legacy static UI (kept for backward compatibility)
// - /public/index.html + /public/script.js live in server/legacy-public
// - /public/images and /public/filters are mapped to the authoritative frontend assets
if (fs.existsSync(LEGACY_PUBLIC_DIR)) {
  app.use('/public', express.static(LEGACY_PUBLIC_DIR));
}
app.get('/public/data.json', (req, res) => res.redirect(301, '/api/data'));

if (IS_PROD) {
  // Production: serve Vite build output from client/dist
  if (fs.existsSync(CLIENT_DIST_DIR)) {
    app.use(express.static(CLIENT_DIST_DIR));
    // Back-compat: allow old /public/images and /public/filters URLs
    app.use('/public/images', express.static(path.join(CLIENT_DIST_DIR, 'images')));
    app.use('/public/filters', express.static(path.join(CLIENT_DIST_DIR, 'filters')));
  } else {
    console.warn('Production mode but client/dist not found at', CLIENT_DIST_DIR);
  }
} else {
  // Development: keep assets available directly from the API server (useful for /public/* legacy page)
  // Primary dev experience should still be via Vite (client) for frontend.
  if (fs.existsSync(CLIENT_PUBLIC_DIR)) {
    app.use('/images', express.static(path.join(CLIENT_PUBLIC_DIR, 'images')));
    app.use('/filters', express.static(path.join(CLIENT_PUBLIC_DIR, 'filters')));
    app.use('/public/images', express.static(path.join(CLIENT_PUBLIC_DIR, 'images')));
    app.use('/public/filters', express.static(path.join(CLIENT_PUBLIC_DIR, 'filters')));
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebase: {
      admin: !!admin,
      firestore: !!db,
      storage: !!bucket
    },
    dataFile: fs.existsSync(path.join(__dirname, 'data.json'))
  };
  res.json(health);
});

app.get('/api/place-stories/:placeId', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'firestore_unavailable', detail: 'Firestore not initialized' });
    }
    const { placeId } = req.params;
    if (!placeId) return res.status(400).json({ error: 'missing_placeId' });
    const snap = await db.collection('places').doc(placeId).collection('stories').orderBy('createdAt', 'desc').limit(50).get();
    const stories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ stories });
  } catch (err) {
    console.error('place-stories error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

app.use('/api', chatRoutes);

// Get persona info for a category
app.get('/api/persona/:category', (req, res) => {
  try {
    const { category } = req.params;
    const persona = getPersonaForCategory(category);
    return res.json(persona);
  } catch (err) {
    console.error('persona error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

// SPA fallback (production only)
// Important: do not hijack API or legacy routes.
if (IS_PROD && fs.existsSync(path.join(CLIENT_DIST_DIR, 'index.html'))) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/public')) return next();
    return res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});