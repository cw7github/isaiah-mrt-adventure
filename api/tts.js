// ElevenLabs TTS API Endpoint (with timestamps)
// Returns base64 audio + word-level timing for word-by-word highlighting.
//
// Note: Vercel may compile ESM → CJS for Node functions. `jose` is ESM-only,
// so we dynamically import it to avoid `ERR_REQUIRE_ESM` in production.

let josePromise = null;
let secureTokenJwks = null;

async function getJose() {
  if (!josePromise) josePromise = import('jose');
  return josePromise;
}

async function getSecureTokenJwks() {
  if (secureTokenJwks) return secureTokenJwks;
  const { createRemoteJWKSet } = await getJose();
  secureTokenJwks = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
  );
  return secureTokenJwks;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_PER_WINDOW = 30;
const rateLimitBuckets = new Map();

const DEFAULT_CACHE_TTL_MS = 5 * 60_000;
const DEFAULT_CACHE_MAX_ENTRIES = 40;
const ttsCache = new Map();

function getFirstIpFromHeader(value) {
  if (!value) return '';
  const raw = Array.isArray(value) ? value[0] : String(value);
  return raw.split(',')[0].trim();
}

function getClientIp(req) {
  return (
    getFirstIpFromHeader(req.headers['x-forwarded-for']) ||
    String(req.headers['x-real-ip'] || '') ||
    String(req.socket?.remoteAddress || '') ||
    ''
  );
}

function parseAllowedOriginConfig() {
  const explicitRegex = process.env.TTS_ALLOWED_ORIGIN_REGEX;
  if (explicitRegex && typeof explicitRegex === 'string' && explicitRegex.trim()) {
    try {
      return { type: 'regex', value: new RegExp(explicitRegex) };
    } catch (e) {
      console.warn('Invalid TTS_ALLOWED_ORIGIN_REGEX; falling back to defaults.', e);
    }
  }

  const list = process.env.TTS_ALLOWED_ORIGINS;
  if (list && typeof list === 'string' && list.trim()) {
    const origins = list
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
    if (origins.length) return { type: 'list', value: new Set(origins) };
  }

  return {
    type: 'default',
    value: {
      hostPatterns: [
        /^isaiah-mrt-adventure(?:-[a-z0-9-]+)?\.vercel\.app$/i,
        /^localhost$/i,
        /^127\.0\.0\.1$/i,
      ],
    },
  };
}

const allowedOriginConfig = parseAllowedOriginConfig();

function isAllowedOrigin(origin) {
  if (!origin) return true; // Non-browser/server-to-server requests won't send Origin.
  if (allowedOriginConfig.type === 'regex') {
    return allowedOriginConfig.value.test(origin);
  }
  if (allowedOriginConfig.type === 'list') {
    return allowedOriginConfig.value.has(origin);
  }

  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return allowedOriginConfig.value.hostPatterns.some(re => re.test(url.hostname));
  } catch {
    return false;
  }
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowed = isAllowedOrigin(origin);

  if (origin && allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  return { origin, allowed };
}

async function verifyFirebaseIdToken(req) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    const err = new Error('Missing FIREBASE_PROJECT_ID');
    err.statusCode = 500;
    throw err;
  }

  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const match = typeof authHeader === 'string' ? authHeader.match(/^Bearer\s+(.+)$/i) : null;
  const token = match && match[1] ? match[1].trim() : '';

  if (!token) {
    const err = new Error('Missing Authorization bearer token');
    err.statusCode = 401;
    throw err;
  }

  try {
    const { jwtVerify } = await getJose();
    const jwks = await getSecureTokenJwks();
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid = payload?.user_id || payload?.sub || null;
    if (!uid) {
      const err = new Error('Invalid token (missing uid)');
      err.statusCode = 401;
      throw err;
    }

    return { uid: String(uid) };
  } catch (e) {
    const err = new Error('Invalid Firebase ID token');
    err.statusCode = 401;
    err.cause = e;
    throw err;
  }
}

function checkRateLimit({ uid, ip }) {
  const limit = Number(process.env.TTS_RATE_LIMIT_PER_MINUTE || DEFAULT_RATE_LIMIT_PER_WINDOW);
  const now = Date.now();
  const windowStart = now - (now % RATE_LIMIT_WINDOW_MS);
  const key = `${uid}:${ip || 'unknown'}`;

  const entry = rateLimitBuckets.get(key);
  if (!entry || entry.windowStart !== windowStart) {
    rateLimitBuckets.set(key, { windowStart, count: 1 });
    return { ok: true, remaining: Math.max(0, limit - 1) };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, remaining: 0, resetAt: entry.windowStart + RATE_LIMIT_WINDOW_MS };
  }

  return { ok: true, remaining: Math.max(0, limit - entry.count) };
}

function getCacheKey({ text, voiceId, modelId, outputFormat }) {
  const normalizedText = String(text || '').trim().toLowerCase();
  return JSON.stringify({
    voiceId: String(voiceId || ''),
    modelId: String(modelId || ''),
    outputFormat: String(outputFormat || ''),
    text: normalizedText,
  });
}

function getCachedTtsResponse(key) {
  const now = Date.now();
  const entry = ttsCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    ttsCache.delete(key);
    return null;
  }
  // Bump for LRU.
  ttsCache.delete(key);
  ttsCache.set(key, entry);
  return entry.value;
}

function setCachedTtsResponse(key, value) {
  const ttlMs = Number(process.env.TTS_CACHE_TTL_MS || DEFAULT_CACHE_TTL_MS);
  const maxEntries = Number(process.env.TTS_CACHE_MAX_ENTRIES || DEFAULT_CACHE_MAX_ENTRIES);
  const now = Date.now();
  ttsCache.set(key, { value, expiresAt: now + Math.max(0, ttlMs) });
  while (ttsCache.size > maxEntries) {
    const oldestKey = ttsCache.keys().next().value;
    if (!oldestKey) break;
    ttsCache.delete(oldestKey);
  }
}

function isWhitespaceChar(char) {
  return typeof char === 'string' && /\s/.test(char);
}

function getMimeTypeFromOutputFormat(outputFormat) {
  const fmt = String(outputFormat || '').toLowerCase();
  if (!fmt) return 'audio/mpeg';
  if (fmt.startsWith('mp3')) return 'audio/mpeg';
  if (fmt.startsWith('pcm')) return 'audio/L16';
  if (fmt.startsWith('ulaw')) return 'audio/basic';
  if (fmt.startsWith('alaw')) return 'audio/basic';
  if (fmt.startsWith('wav')) return 'audio/wav';
  return 'audio/mpeg';
}

function buildWordTimingsFromAlignment(alignment) {
  if (!alignment) return null;
  const chars = Array.isArray(alignment.characters) ? alignment.characters : null;
  const starts = Array.isArray(alignment.character_start_times_seconds)
    ? alignment.character_start_times_seconds
    : null;
  const ends = Array.isArray(alignment.character_end_times_seconds) ? alignment.character_end_times_seconds : null;

  if (!chars || !starts || !ends) return null;

  const n = Math.min(chars.length, starts.length, ends.length);
  if (n <= 0) return null;

  const words = [];
  const startMs = [];
  const endMs = [];

  let currentChars = [];
  let currentStartMs = null;
  let currentEndMs = null;

  const pushCurrent = () => {
    if (currentChars.length === 0) return;
    const word = currentChars.join('');
    if (!word) return;
    const s = Number.isFinite(currentStartMs) ? currentStartMs : null;
    const e = Number.isFinite(currentEndMs) ? currentEndMs : null;
    if (s === null || e === null) return;
    words.push(word);
    startMs.push(s);
    endMs.push(e);
    currentChars = [];
    currentStartMs = null;
    currentEndMs = null;
  };

  for (let i = 0; i < n; i++) {
    const ch = chars[i];
    if (isWhitespaceChar(ch)) {
      pushCurrent();
      continue;
    }

    if (currentChars.length === 0) {
      const s = starts[i];
      currentStartMs = Number.isFinite(s) ? s * 1000 : currentStartMs;
    }

    currentChars.push(String(ch));
    const e = ends[i];
    currentEndMs = Number.isFinite(e) ? e * 1000 : currentEndMs;
  }

  pushCurrent();

  if (words.length === 0) return null;

  // Ensure monotonic word timings to avoid UI glitches.
  let lastEnd = 0;
  for (let i = 0; i < words.length; i++) {
    const sRaw = startMs[i];
    const eRaw = endMs[i];
    const s = Number.isFinite(sRaw) ? sRaw : lastEnd;
    const e = Number.isFinite(eRaw) ? eRaw : s;
    const s2 = Math.max(s, lastEnd);
    const e2 = Math.max(e, s2);
    startMs[i] = s2;
    endMs[i] = e2;
    lastEnd = e2;
  }

  return { words, startMs, endMs };
}

export default async function handler(req, res) {
  const { origin, allowed } = setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    if (origin && !allowed) return res.status(403).end();
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (origin && !allowed) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  let auth = null;
  try {
    auth = await verifyFirebaseIdToken(req);
  } catch (e) {
    const status = e && Number.isFinite(e.statusCode) ? e.statusCode : 401;
    if (status >= 500) {
      return res.status(status).json({ error: 'Server misconfigured' });
    }
    return res.status(status).json({ error: 'Unauthorized' });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit({ uid: auth.uid, ip });
  if (!rate.ok) {
    if (rate.resetAt) {
      res.setHeader('Retry-After', Math.ceil((rate.resetAt - Date.now()) / 1000));
    }
    return res.status(429).json({ error: 'Rate limited' });
  }

  const readJsonBody = async () => {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return { text: req.body };
      }
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return { text: raw };
      }
    } catch {
      return {};
    }
  };

  const body = await readJsonBody();
  const text = body && typeof body.text === 'string' ? body.text : '';

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing ELEVENLABS_API_KEY',
      message: 'Set ELEVENLABS_API_KEY in your environment (Vercel project env or .env.local).'
    });
  }

  // Default to a clear, educational US voice for early readers.
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'lqydY2xVUkg9cEIFmFMU'; // Angela
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3';
  const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || ''; // e.g. mp3_44100_128 or pcm_24000

  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`);
  if (outputFormat) url.searchParams.set('output_format', outputFormat);

  try {
    const cacheKey = getCacheKey({ text, voiceId, modelId, outputFormat });
    const cached = getCachedTtsResponse(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('ElevenLabs TTS API error:', errorText);
      return res.status(response.status).json({
        error: 'TTS API request failed',
        details: errorText,
      });
    }

    const data = await response.json();
    if (!data || !data.audio_base64) {
      return res.status(500).json({
        error: 'No audio data in ElevenLabs response',
        response: data,
      });
    }

    const alignment = data.alignment || null;
    const wordTimings = buildWordTimingsFromAlignment(alignment);

    const payload = {
      audio: data.audio_base64,
      mimeType: getMimeTypeFromOutputFormat(outputFormat),
      outputFormat: outputFormat || 'default',
      wordTimings,
    };

    setCachedTtsResponse(cacheKey, payload);
    return res.status(200).json(payload);
  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || String(error),
    });
  }
}
