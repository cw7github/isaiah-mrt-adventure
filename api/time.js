// Simple server time endpoint (for clock-skew mitigation on multi-device sync).
// Returns current server time in milliseconds.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ nowMs: Date.now() });
}

