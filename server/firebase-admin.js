const admin = require("firebase-admin");
const path = require("path");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "heritage-canvas-ca8e4.firebasestorage.app"
  });
}

module.exports = admin;
