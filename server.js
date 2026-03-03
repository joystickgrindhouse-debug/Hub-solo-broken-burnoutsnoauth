const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const { registerChatRoutes } = require("./replit_integrations/chat");
const { registerImageRoutes } = require("./replit_integrations/image");
const { getRandomSocialImage, getSocialImageById } = require("./replit_integrations/live-engine-sync/socialImages");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   FIREBASE AUTH MIDDLEWARE
================================= */

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const { admin } = require('./src/firebase_server');
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/* ===============================
   LIVE ENGINE INTEGRATION
================================= */

function getLiveEngineBaseUrl() {
  return (process.env.LIVE_ENGINE_URL || '').replace(/\/$/, '');
}

async function callLiveEngine(path, method = 'GET', body = null) {
  const baseUrl = getLiveEngineBaseUrl();
  if (!baseUrl) {
    throw new Error('LIVE_ENGINE_URL is not configured');
  }

  const headers = { 'Content-Type': 'application/json' };

  if (process.env.LIVE_ENGINE_API_KEY) {
    headers.Authorization = `Bearer ${process.env.LIVE_ENGINE_API_KEY}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Live Engine request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

/* ===============================
   LIVE ENGINE ROUTES
================================= */

app.get('/api/live-engine/health', async (_req, res) => {
  try {
    const health = await callLiveEngine('/health');
    res.json({ success: true, health });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/api/live-engine/rooms/create', async (req, res) => {
  try {
    const { gameMode, exerciseName, showdown } = req.body || {};

    const created = await callLiveEngine('/sessions', 'POST', {
      gameMode: gameMode || 'classic',
      exerciseName: exerciseName || showdown?.name || 'pushups',
      showdown: showdown?.id || 'hub',
    });

    res.json({
      success: true,
      sessionId: created?.sessionId || created?.id || null,
      room: created || null,
    });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

app.get('/api/live-engine/rooms/:sessionId', async (req, res) => {
  try {
    const room = await callLiveEngine(`/sessions/${req.params.sessionId}`);
    res.json({ success: true, room });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/api/live-engine/rooms/:sessionId/start', async (req, res) => {
  try {
    const started = await callLiveEngine(
      `/sessions/${req.params.sessionId}/start`,
      'POST',
      req.body || {}
    );
    res.json({ success: true, data: started });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/api/live-engine/rooms/:sessionId/end', async (req, res) => {
  try {
    const ended = await callLiveEngine(
      `/sessions/${req.params.sessionId}/end`,
      'POST',
      req.body || {}
    );
    res.json({ success: true, data: ended });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

/* ===============================
   SESSION ARCHIVE
================================= */

app.post('/api/live-engine/sessions/ended', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const expectedSecret = process.env.HUB_API_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      sessionId,
      endedAt,
      winner,
      finalLeaderboard,
      sessionDurationMs,
      exerciseName,
      gameMode,
      socialImage,
      imageId,
      imageUrl,
    } = req.body || {};

    if (!sessionId || !Array.isArray(finalLeaderboard)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, finalLeaderboard[]',
      });
    }

    const { db } = require('./src/firebase_server');

    const selectedSocialImage =
      socialImage ||
      (imageId ? getSocialImageById(imageId) : null) ||
      (imageUrl
        ? { id: null, url: imageUrl, description: 'Provided social image' }
        : null) ||
      getRandomSocialImage();

    await db.collection('liveSessionArchive').doc(sessionId).set(
      {
        sessionId,
        exerciseName: exerciseName || null,
        gameMode: gameMode || 'standard',
        endedAt: endedAt || Date.now(),
        durationMs: Number.isFinite(Number(sessionDurationMs))
          ? Number(sessionDurationMs)
          : null,
        winner: winner || null,
        finalLeaderboard,
        socialImage: selectedSocialImage,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ===============================
   REGISTER OTHER ROUTES
================================= */

registerChatRoutes(app);
registerImageRoutes(app);

/* ===============================
   START SERVER
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
