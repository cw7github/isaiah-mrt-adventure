// Firebase public config endpoint (for client-side initialization).
// Keeps Firebase project identifiers out of the static HTML so Vercel env vars can manage them.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  const enabled = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

  res.status(200).json({
    enabled,
    config: enabled ? config : null,
    missing: enabled
      ? []
      : ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_APP_ID'].filter(
          key => !process.env[key]
        ),
  });
}
