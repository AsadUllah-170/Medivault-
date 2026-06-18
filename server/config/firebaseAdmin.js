const admin = require('firebase-admin');

// Ensure you have your service account key JSON file content in env vars or file
// For demo purposes, initializing app without credentials if running locally without service account
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (e) {
  console.warn('Firebase Admin init warning:', e.message);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
