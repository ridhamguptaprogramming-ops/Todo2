const admin = require('firebase-admin');

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  return key ? key.replace(/\\n/g, '\n') : undefined;
};

const hasServiceAccountEnv = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);
const hasApplicationDefaultConfig = Boolean(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_PROJECT_ID
);

if (!admin.apps.length) {
  if (hasServiceAccountEnv) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey()
      })
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
}

const db = admin.firestore();

module.exports = {
  admin,
  db,
  hasFirebaseConfig: hasServiceAccountEnv || hasApplicationDefaultConfig
};
