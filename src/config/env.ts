export const env = {
  databaseUrl: process.env.DATABASE_URL,
  firebase: {
    apiKey: process.env.FirebaseApiKey,
    authDomain: process.env.FirebaseAuthDomain,
    projectId: process.env.FirebaseProjectId,
    storageBucket: process.env.FirebaseStorageBucket,
    messagingSenderId: process.env.FirebaseMessagingSenderId,
    appId: process.env.FirebaseAppId,
    measurementId: process.env.FirebaseMeasurementId,
  },
  firebaseAdmin: {
    projectId: process.env.FirebaseAdminProjectId,
    clientEmail: process.env.FirebaseClientEmail,
    privateKey: process.env.FirebasePrivateKey,
  },
};
