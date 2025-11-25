// server/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'serviceAccountKey.json');

let db = null;
let bucket = null;

try {
  console.log('Initializing Firebase Admin SDK...');
  console.log('Service account key path:', keyPath);
  
  const serviceAccount = require(keyPath);
  console.log('Service account loaded for project:', serviceAccount.project_id);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.log('Firebase Admin already initialized');
  }
  
  db = admin.firestore();
  bucket = admin.storage().bucket();
  console.log('Firestore and Storage ready');
  
} catch (e) {
  console.error('CRITICAL: Firebase Admin initialization failed');
  console.error('Error details:', e.message);
  console.error('Stack:', e.stack);
  
  if (/ENOENT|Cannot find module/u.test(e.message || '')) {
    console.error('Missing service account JSON at', keyPath);
    console.error('Please ensure serviceAccountKey.json exists in the server directory');
  }
  
  // Don't throw - let server start but endpoints will fail gracefully
  console.error('Server will start but Firebase features will not work');
}

module.exports = { admin, db, bucket };