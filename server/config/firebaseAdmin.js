const admin = require('firebase-admin');

let initialized = false;

if (!initialized) {
  try {
    // Support service account JSON stored as an environment variable (for Render/cloud deploys)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Fallback: path to service account file
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      // Last resort for local dev without credentials (limited functionality)
      console.warn(
        '⚠️  No Firebase service account credentials found.\n' +
        '   Set FIREBASE_SERVICE_ACCOUNT (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (file path).'
      );
      admin.initializeApp();
    }
    initialized = true;
  } catch (e) {
    console.error('Firebase Admin init error:', e.message);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
