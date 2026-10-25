import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OAuth2Client } from 'google-auth-library';
import { database, hashAdminPassword } from './src/server/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;
const FEEDBACK_CATEGORIES = [
  'Incorrect answer',
  'Incomplete information',
  'Difficult to understand',
  'Irrelevant response',
  'Slow response',
  'Other',
];
const ADMIN_SESSION_COOKIE = 'chatbot_admin_session';
const adminLoginAttempts = new Map();
const GOOGLE_SESSION_COOKIE = 'chatbot_session';
const GOOGLE_OAUTH_STATE_COOKIE = 'chatbot_google_oauth_state';
const googleOAuthStates = new Map();
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/api/auth/google/callback';
const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri
);

// Support large base64 image payloads up to 25MB
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const rawKey = process.env.GEMINI_API_KEY;
  const hasKey = Boolean(rawKey && rawKey.trim() && rawKey.trim() !== 'your_api_key_here');
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  });
});

// Chat endpoint using official Google Gemini SDK with SSE streaming
app.post('/api/chat', async (req, res) => {
  const { messages, model = 'gemini-1.5-flash', systemPrompt, temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendChunk = (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  };

  const endStream = () => {
    res.write('data: [DONE]\n\n');
    res.end();
  };

  // Read API Key from client header (if explicitly testing a key) or backend environment variable
  const rawKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
  const apiKey = rawKey && rawKey.trim() !== 'your_api_key_here' ? rawKey.trim() : null;

  // Requirement 6: Clear setup error when API key is missing
  if (!apiKey) {
    sendChunk('AI is not configured yet. Please add GEMINI_API_KEY to the backend .env file and restart the server.');
    return endStream();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Filter out retired/deprecated models from requested model
    const requestedModel = (model && !model.includes('1.5') && !model.includes('2.5-flash'))
      ? model
      : (process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite');

    // Candidate models in order of priority (starting with verified working models)
    const candidateModels = Array.from(new Set([
      requestedModel,
      process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ])).filter(Boolean);

    // Format conversation history for multi-turn chat (including image inputs)
    const contents = [];

    for (const msg of messages) {
      const parts = [];

      // Attach image data if present (multimodal vision)
      if (msg.files && Array.isArray(msg.files)) {
        for (const file of msg.files) {
          if (file.data && file.type && file.type.startsWith('image/')) {
            const base64Data = file.data.includes('base64,')
              ? file.data.split('base64,')[1]
              : file.data;

            parts.push({
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            });
          }
        }
      }

      // Add user/assistant text prompt
      if (msg.content && msg.content.trim()) {
        parts.push({ text: msg.content.trim() });
      } else if (parts.length > 0) {
        // If image was sent without accompanying text
        parts.push({ text: 'Please analyze and explain this image in detail.' });
      }

      if (parts.length > 0) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts,
        });
      }
    }

    if (contents.length === 0) {
      sendChunk('Please provide a message or an image to analyze.');
      return endStream();
    }

    let lastError = null;
    let streamSucceeded = false;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Try candidate models in order if one fails with 404 or 503
    for (const currentModel of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await delay(1000);
          }

          const generativeModel = genAI.getGenerativeModel({
            model: currentModel,
            systemInstruction: systemPrompt && systemPrompt.trim() ? systemPrompt.trim() : undefined,
            generationConfig: {
              temperature: Number(temperature) || 0.7,
            },
          });

          // Attempt streaming first
          try {
            const result = await generativeModel.generateContentStream({ contents });

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                sendChunk(chunkText);
              }
            }

            streamSucceeded = true;
            break; // Successfully streamed entire response
          } catch (streamErr) {
            // If streaming hits 503 high demand spike, attempt direct generateContent fallback
            if (streamErr.status === 503 || streamErr.message?.includes('503')) {
              console.warn(`Streaming 503 on ${currentModel}, trying direct generateContent fallback...`);
              const directResult = await generativeModel.generateContent({ contents });
              const directText = directResult.response.text();
              if (directText) {
                sendChunk(directText);
                streamSucceeded = true;
                break;
              }
            }
            throw streamErr;
          }
        } catch (modelErr) {
          lastError = modelErr;
          console.warn(`Model [${currentModel}] attempt ${attempt + 1} failed:`, modelErr.message?.split('\n')[0]);
          // If API key is completely invalid, fail early
          if (modelErr.message?.includes('API_KEY_INVALID') || modelErr.message?.includes('API key not valid')) {
            break;
          }
        }
      }

      if (streamSucceeded) break;
    }

    if (!streamSucceeded) {
      throw lastError || new Error('All model attempts failed');
    }

    return endStream();
  } catch (err) {
    console.error('Gemini API Error:', err);
    let userFriendlyMsg = 'Sorry, the AI response could not be generated at this time.';

    if (err.message) {
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid')) {
        userFriendlyMsg = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in the backend .env file.';
      } else if (err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('429')) {
        userFriendlyMsg = 'Quota limit reached for Gemini API. Please wait a moment or try again later.';
      } else if (err.message.includes('SAFETY') || err.message.includes('blocked')) {
        userFriendlyMsg = 'This response was blocked by Google AI safety filters.';
      } else {
        userFriendlyMsg = `Unable to generate response: ${err.message}`;
      }
    }

    sendChunk(userFriendlyMsg);
    return endStream();
  }
});

// ==========================================
// REAL AUTHENTICATION & SESSION MANAGEMENT
// ==========================================

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SCHEDULED_FILE = path.join(DATA_DIR, 'scheduled.json');
const sessions = new Map(); // token -> { userId, email, expiresAt }
const resetCodes = new Map(); // email -> { code, expiresAt }

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || '').split(';');
  const cookie = cookies.find((part) => part.trim().startsWith(`${name}=`));
  return cookie ? cookie.trim().slice(name.length + 1) : '';
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getGoogleSessionUser(req) {
  const token = cookieValue(req, GOOGLE_SESSION_COOKIE);
  if (!token) return null;
  const session = database.prepare(`
    SELECT u.user_id AS id, u.email, u.display_name AS name, u.picture_url AS picture,
      u.created_at AS createdAt, s.expires_at AS expiresAt
    FROM app_sessions s
    JOIN app_users u ON u.user_id = s.user_id
    WHERE s.token_hash = ?
  `).get(hashSessionToken(token));
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    database.prepare('DELETE FROM app_sessions WHERE token_hash = ?').run(hashSessionToken(token));
    return null;
  }
  return session;
}

function setCookie(res, name, value, { path: cookiePath, maxAge }) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.append('Set-Cookie', `${name}=${value}; Path=${cookiePath}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

function clearCookie(res, name, cookiePath) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.append('Set-Cookie', `${name}=; Path=${cookiePath}; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function googleSignInError(res, reason) {
  res.redirect(`/signin?error=${encodeURIComponent(reason)}`);
}

app.get('/api/auth/google/start', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return googleSignInError(res, 'not_configured');
  }

  const requestedReturnTo = String(req.query.returnTo || '/');
  const returnTo = requestedReturnTo.startsWith('/')
    && !requestedReturnTo.startsWith('//')
    && !requestedReturnTo.includes('\\')
    ? requestedReturnTo
    : '/';

  const state = crypto.randomBytes(32).toString('base64url');
  const nonce = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  for (const [savedState, value] of googleOAuthStates) {
    if (now - value.createdAt > 10 * 60 * 1000) googleOAuthStates.delete(savedState);
  }
  googleOAuthStates.set(state, { nonce, returnTo, createdAt: now });
  setCookie(res, GOOGLE_OAUTH_STATE_COOKIE, state, { path: '/api/auth/google', maxAge: 600 });

  const authorizationUrl = googleOAuthClient.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
    nonce,
  });
  return res.redirect(authorizationUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const savedState = googleOAuthStates.get(state);
  const stateCookie = cookieValue(req, GOOGLE_OAUTH_STATE_COOKIE);
  clearCookie(res, GOOGLE_OAUTH_STATE_COOKIE, '/api/auth/google');

  if (!state || !savedState || stateCookie !== state || Date.now() - savedState.createdAt > 10 * 60 * 1000) {
    googleOAuthStates.delete(state);
    return googleSignInError(res, 'invalid_state');
  }
  googleOAuthStates.delete(state);

  if (req.query.error) return googleSignInError(res, 'cancelled');
  if (typeof req.query.code !== 'string') return googleSignInError(res, 'failed');

  try {
    const { tokens } = await googleOAuthClient.getToken(req.query.code);
    if (!tokens.id_token) throw new Error('Google did not return an ID token.');
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (!profile?.sub || !profile.email || profile.email_verified !== true || profile.nonce !== savedState.nonce) {
      throw new Error('Google identity or OAuth nonce validation failed.');
    }

    const timestamp = new Date().toISOString();
    const userId = `google_${crypto.randomUUID()}`;
    database.prepare(`
      INSERT INTO app_users (user_id, google_sub, email, display_name, picture_url, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        display_name = excluded.display_name,
        picture_url = excluded.picture_url,
        last_login_at = excluded.last_login_at
    `).run(
      userId,
      profile.sub,
      profile.email.trim().toLowerCase(),
      String(profile.name || profile.email).slice(0, 200),
      typeof profile.picture === 'string' ? profile.picture : '',
      timestamp,
      timestamp
    );

    const user = database.prepare('SELECT user_id FROM app_users WHERE google_sub = ?').get(profile.sub);
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    database.prepare('DELETE FROM app_sessions WHERE expires_at <= ?').run(timestamp);
    database.prepare(`
      INSERT INTO app_sessions (token_hash, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(hashSessionToken(sessionToken), user.user_id, sessionExpiry, timestamp);

    setCookie(res, GOOGLE_SESSION_COOKIE, sessionToken, { path: '/api', maxAge: 7 * 24 * 60 * 60 });
    return res.redirect(savedState.returnTo);
  } catch (error) {
    console.error('Google sign-in failed:', error.message);
    return googleSignInError(res, 'failed');
  }
});

app.get('/api/auth/session', (req, res) => {
  const googleUser = getGoogleSessionUser(req);
  if (googleUser) {
    const { expiresAt, ...user } = googleUser;
    return res.json({ user: { ...user, provider: 'google' } });
  }

  const token = getBearerToken(req);
  const session = token ? sessions.get(token) : null;
  if (!session || Date.now() > session.expiresAt) {
    if (session) sessions.delete(token);
    return res.json({ user: null });
  }
  const user = loadUsers().find((record) => record.id === session.userId);
  if (!user) return res.json({ user: null });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, provider: 'password' },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const googleToken = cookieValue(req, GOOGLE_SESSION_COOKIE);
  if (googleToken) {
    database.prepare('DELETE FROM app_sessions WHERE token_hash = ?').run(hashSessionToken(googleToken));
  }
  const bearerToken = getBearerToken(req);
  if (bearerToken) sessions.delete(bearerToken);
  clearCookie(res, GOOGLE_SESSION_COOKIE, '/api');
  return res.status(204).end();
});

function seedAdminAccount() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email && !password) {
    console.warn('Admin login is disabled. Configure ADMIN_EMAIL and ADMIN_PASSWORD to provision an administrator.');
    return;
  }
  if (!email || !password || password.length < 14 || !email.includes('@')) {
    throw new Error('ADMIN_EMAIL and an ADMIN_PASSWORD of at least 14 characters are required.');
  }
  if (password === 'replace-with-a-unique-strong-secret') {
    throw new Error('Replace the example ADMIN_PASSWORD before starting the backend.');
  }

  const adminId = `admin_${crypto.createHash('sha256').update(email).digest('hex').slice(0, 24)}`;
  database.prepare(`
    INSERT INTO admin_accounts (admin_id, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash
  `).run(adminId, email, hashAdminPassword(password), new Date().toISOString());
}

seedAdminAccount();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Error reading users.json:', e);
  }

  // Pre-seed default demo account
  const salt = crypto.randomBytes(16).toString('hex');
  const initialUser = {
    id: 'user_default',
    name: 'Explorer',
    email: 'explorer@chatbot.ai',
    salt,
    hash: hashPassword('password123', salt),
    createdAt: new Date().toISOString(),
  };

  saveUsers([initialUser]);
  return [initialUser];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing users.json:', e);
  }
}

// Helper: load scheduled tasks
function loadScheduled() {
  try {
    if (fs.existsSync(SCHEDULED_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULED_FILE, 'utf-8'));
    }
  } catch (_) {}
  return [];
}

function saveScheduled(tasks) {
  try {
    fs.writeFileSync(SCHEDULED_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (_) {}
}

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const newUser = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    name: name.trim(),
    email: normalizedEmail,
    salt,
    hash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: newUser.id,
    email: newUser.email,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  res.json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
    token,
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.hash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim() || req.headers['x-auth-token'];

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = sessions.get(token);
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.id === session.userId);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Please enter your email address.' });

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + 1000 * 60 * 15, // 15 mins
  });

  res.json({
    success: true,
    message: 'Reset code generated successfully.',
    resetCode: code, // Delivered so the user can test resetting right away
  });
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = resetCodes.get(normalizedEmail);

  if (!record || record.code !== code.trim() || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired reset code.' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.hash = hashPassword(newPassword, newSalt);
  saveUsers(users);
  resetCodes.delete(normalizedEmail);

  res.json({ success: true, message: 'Password has been updated successfully. You can now log in.' });
});

function getBearerToken(req) {
  const authorization = req.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

function getSignedInUser(req) {
  const googleUser = getGoogleSessionUser(req);
  if (googleUser) return { id: googleUser.id, email: googleUser.email };
  const token = getBearerToken(req);
  const session = token ? sessions.get(token) : null;
  if (!session || Date.now() > session.expiresAt) return null;
  return { id: session.userId, email: session.email };
}

function getAnonymousId(req) {
  const anonymousId = String(req.get('x-anonymous-id') || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(anonymousId)
    ? anonymousId
    : null;
}

function parseFeedbackRow(row, { includePrivate = false } = {}) {
  if (!row) return null;
  const feedback = {
    id: row.feedback_id,
    feedbackType: row.feedback_type,
    userId: row.user_id,
    anonymousId: row.anonymous_id,
    conversationId: row.conversation_id,
    responseId: row.response_id,
    starRating: row.star_rating,
    thumbsRating: row.thumbs_rating === null ? null : Boolean(row.thumbs_rating),
    categories: JSON.parse(row.categories_json || '[]'),
    comment: row.comment,
    submittedAt: row.submitted_at,
    status: row.status,
    updatedAt: row.updated_at,
  };
  if (includePrivate) {
    feedback.responseContent = row.response_content;
    feedback.adminNote = row.admin_note;
  }
  return feedback;
}

app.post('/api/feedback', (req, res) => {
  try {
    const {
      feedbackType = 'response',
      conversationId,
      responseId,
      responseContent = '',
      starRating = null,
      thumbsRating = null,
      categories = [],
      comment = '',
    } = req.body || {};
    const user = getSignedInUser(req);
    const anonymousId = user ? null : getAnonymousId(req);

    if (!user && !anonymousId) {
      return res.status(400).json({ error: 'A valid anonymous session identifier is required.' });
    }
    if (!['response', 'overall'].includes(feedbackType)) {
      return res.status(400).json({ error: 'Invalid feedback type.' });
    }
    if (feedbackType === 'response' &&
      (!/^[\w-]{1,120}$/.test(String(conversationId || '')) ||
        !/^[\w-]{1,120}$/.test(String(responseId || '')))) {
      return res.status(400).json({ error: 'Valid conversation and AI response identifiers are required.' });
    }
    if (starRating !== null && (!Number.isInteger(starRating) || starRating < 1 || starRating > 5)) {
      return res.status(400).json({ error: 'Star rating must be between 1 and 5.' });
    }
    if (thumbsRating !== null && typeof thumbsRating !== 'boolean') {
      return res.status(400).json({ error: 'Thumbs rating must be true, false, or omitted.' });
    }
    if (starRating === null && thumbsRating === null) {
      return res.status(400).json({ error: 'Select a star or thumbs rating before submitting.' });
    }
    if (!Array.isArray(categories) || categories.length > FEEDBACK_CATEGORIES.length ||
      categories.some((category) => !FEEDBACK_CATEGORIES.includes(category))) {
      return res.status(400).json({ error: 'One or more feedback categories are invalid.' });
    }
    if (typeof comment !== 'string' || comment.length > 2000) {
      return res.status(400).json({ error: 'Comments must be 2,000 characters or fewer.' });
    }
    if (typeof responseContent !== 'string' || responseContent.length > 10000) {
      return res.status(400).json({ error: 'The response reference is invalid or too long.' });
    }

    const now = new Date().toISOString();
    const feedbackId = crypto.randomUUID();
    const subjectKey = user ? `user:${user.id}` : `anonymous:${anonymousId}`;
    const responseFields = feedbackType === 'response'
      ? [conversationId, responseId, responseContent.slice(0, 10000)]
      : [null, null, null];
    const savedRow = database.prepare(`
      INSERT INTO feedback (
        feedback_id, subject_key, user_id, anonymous_id, feedback_type,
        conversation_id, response_id, response_content, star_rating, thumbs_rating,
        categories_json, comment, submitted_at, status, admin_note, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', '', ?)
      ON CONFLICT(subject_key, conversation_id, response_id)
        WHERE feedback_type = 'response'
      DO UPDATE SET
        star_rating = excluded.star_rating,
        thumbs_rating = excluded.thumbs_rating,
        categories_json = excluded.categories_json,
        comment = excluded.comment,
        response_content = excluded.response_content,
        status = 'New',
        admin_note = '',
        submitted_at = excluded.submitted_at,
        updated_at = excluded.updated_at
      RETURNING *
    `).get(
      feedbackId,
      subjectKey,
      user?.id || null,
      anonymousId,
      feedbackType,
      ...responseFields,
      starRating,
      thumbsRating === null ? null : Number(thumbsRating),
      JSON.stringify(categories),
      comment.trim(),
      now,
      now
    );

    res.status(201).json({ feedback: parseFeedbackRow(savedRow) });
  } catch (error) {
    console.error('Feedback submission failed:', error.message);
    res.status(500).json({ error: 'Feedback could not be saved. Please try again.' });
  }
});

app.get('/api/feedback/mine', (req, res) => {
  try {
    const user = getSignedInUser(req);
    const anonymousId = user ? null : getAnonymousId(req);
    if (!user && !anonymousId) {
      return res.status(400).json({ error: 'A valid anonymous session identifier is required.' });
    }
    const subjectKey = user ? `user:${user.id}` : `anonymous:${anonymousId}`;
    const rows = database.prepare(`
      SELECT feedback_id, feedback_type, user_id, anonymous_id, conversation_id,
        response_id, star_rating, thumbs_rating, categories_json, comment,
        submitted_at, status, updated_at
      FROM feedback
      WHERE subject_key = ?
      ORDER BY submitted_at DESC
    `).all(subjectKey);
    res.json({ feedback: rows.map((row) => parseFeedbackRow(row)) });
  } catch (error) {
    console.error('Unable to retrieve user feedback:', error.message);
    res.status(500).json({ error: 'Feedback could not be loaded.' });
  }
});

function adminTokenFromRequest(req) {
  const cookies = String(req.headers.cookie || '').split(';');
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith(`${ADMIN_SESSION_COOKIE}=`));
  return sessionCookie ? decodeURIComponent(sessionCookie.trim().slice(ADMIN_SESSION_COOKIE.length + 1)) : '';
}

function adminForRequest(req) {
  const token = adminTokenFromRequest(req);
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return database.prepare(`
    SELECT a.admin_id, a.email
    FROM admin_sessions s
    JOIN admin_accounts a ON a.admin_id = s.admin_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(tokenHash, new Date().toISOString()) || null;
}

function requireAdmin(req, res, next) {
  const admin = adminForRequest(req);
  if (!admin) return res.status(401).json({ error: 'Administrator authentication required.' });
  req.admin = admin;
  next();
}

function validAdminOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return true;
  const allowed = new Set([
    process.env.APP_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean));
  return allowed.has(origin);
}

app.post('/api/admin/auth/login', (req, res) => {
  try {
    if (!validAdminOrigin(req)) return res.status(403).json({ error: 'Request origin is not allowed.' });
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password || email.length > 254 || password.length > 1024) {
      return res.status(400).json({ error: 'Enter your administrator email and password.' });
    }

    const address = req.ip || 'unknown';
    const attempts = adminLoginAttempts.get(address);
    if (attempts && attempts.count >= 8 && Date.now() - attempts.startedAt < 15 * 60 * 1000) {
      return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
    }

    const admin = database.prepare('SELECT * FROM admin_accounts WHERE email = ?').get(email);
    let validPassword = false;
    if (admin) {
      const [saltHex, expectedHashHex] = admin.password_hash.split(':');
      const actualHash = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
      const expectedHash = Buffer.from(expectedHashHex, 'hex');
      validPassword = expectedHash.length === actualHash.length && crypto.timingSafeEqual(actualHash, expectedHash);
    }
    if (!validPassword) {
      const nextAttempts = !attempts || Date.now() - attempts.startedAt >= 15 * 60 * 1000
        ? { count: 1, startedAt: Date.now() }
        : { ...attempts, count: attempts.count + 1 };
      adminLoginAttempts.set(address, nextAttempts);
      return res.status(401).json({ error: 'Invalid administrator email or password.' });
    }

    adminLoginAttempts.delete(address);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    database.prepare('INSERT INTO admin_sessions (token_hash, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
      .run(tokenHash, admin.admin_id, expiresAt, new Date().toISOString());
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=28800${secure}`);
    res.json({ admin: { id: admin.admin_id, email: admin.email }, expiresAt });
  } catch (error) {
    console.error('Admin login failed:', error.message);
    res.status(500).json({ error: 'Administrator sign-in is unavailable.' });
  }
});

app.get('/api/admin/auth/me', requireAdmin, (req, res) => {
  res.json({ admin: { id: req.admin.admin_id, email: req.admin.email } });
});

app.post('/api/admin/auth/logout', (req, res) => {
  try {
    if (!validAdminOrigin(req)) return res.status(403).json({ error: 'Request origin is not allowed.' });
    const token = adminTokenFromRequest(req);
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      database.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
    }
    res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Admin logout failed:', error.message);
    res.status(500).json({ error: 'Could not end administrator session.' });
  }
});

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  try {
    const overview = database.prepare(`
      SELECT
        COUNT(*) AS total,
        ROUND(AVG(star_rating), 2) AS average_rating,
        SUM(CASE WHEN thumbs_rating = 1 THEN 1 ELSE 0 END) AS positive,
        SUM(CASE WHEN thumbs_rating = 0 THEN 1 ELSE 0 END) AS negative,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS new_count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count
      FROM feedback
    `).get();
    const ratingDistribution = database.prepare(`
      SELECT star_rating AS rating, COUNT(*) AS count
      FROM feedback
      WHERE star_rating IS NOT NULL
      GROUP BY star_rating
    `).all();
    const trend = database.prepare(`
      SELECT substr(submitted_at, 1, 10) AS date, COUNT(*) AS count
      FROM feedback
      WHERE submitted_at >= ?
      GROUP BY substr(submitted_at, 1, 10)
      ORDER BY date ASC
    `).all(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString());
    res.json({
      overview: {
        total: overview.total || 0,
        averageRating: overview.average_rating,
        positive: overview.positive || 0,
        negative: overview.negative || 0,
        newCount: overview.new_count || 0,
        resolvedCount: overview.resolved_count || 0,
      },
      ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: ratingDistribution.find((item) => item.rating === rating)?.count || 0,
      })),
      feedbackTrend: trend,
    });
  } catch (error) {
    console.error('Admin dashboard query failed:', error.message);
    res.status(500).json({ error: 'Dashboard statistics could not be loaded.' });
  }
});

app.get('/api/admin/feedback', requireAdmin, (req, res) => {
  try {
    const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
    const pageSize = Math.max(1, Math.min(100, Number.parseInt(req.query.pageSize, 10) || 20));
    const clauses = [];
    const params = [];
    const { rating, category, status, from, to, search } = req.query;
    if (rating && /^[1-5]$/.test(String(rating))) {
      clauses.push('f.star_rating = ?');
      params.push(Number(rating));
    }
    if (category && FEEDBACK_CATEGORIES.includes(String(category))) {
      clauses.push('instr(f.categories_json, ?) > 0');
      params.push(JSON.stringify(category));
    }
    if (status && ['New', 'Reviewed', 'Resolved'].includes(String(status))) {
      clauses.push('f.status = ?');
      params.push(String(status));
    }
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(String(from))) {
      clauses.push('substr(f.submitted_at, 1, 10) >= ?');
      params.push(String(from));
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(String(to))) {
      clauses.push('substr(f.submitted_at, 1, 10) <= ?');
      params.push(String(to));
    }
    if (search && String(search).length <= 200) {
      clauses.push('(f.feedback_id LIKE ? OR COALESCE(f.user_id, f.anonymous_id, \'\') LIKE ?)');
      params.push(`%${String(search)}%`, `%${String(search)}%`);
    }

    const sort = req.query.sort === 'oldest' ? 'ASC' : req.query.sort === 'rating' ? 'RATING' : 'DESC';
    const orderBy = sort === 'RATING' ? 'f.star_rating DESC, f.submitted_at DESC' : `f.submitted_at ${sort}`;
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const total = database.prepare(`SELECT COUNT(*) AS count FROM feedback f ${where}`).get(...params).count;
    const rows = database.prepare(`
      SELECT f.* FROM feedback f ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...params, pageSize, (page - 1) * pageSize);

    res.json({
      feedback: rows.map((row) => ({
        ...parseFeedbackRow(row, { includePrivate: true }),
        userIdentifier: row.user_id || row.anonymous_id,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error('Admin feedback list query failed:', error.message);
    res.status(500).json({ error: 'Feedback could not be loaded.' });
  }
});

app.get('/api/admin/feedback/:id', requireAdmin, (req, res) => {
  try {
    const row = database.prepare('SELECT * FROM feedback WHERE feedback_id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Feedback record not found.' });
    res.json({
      feedback: {
        ...parseFeedbackRow(row, { includePrivate: true }),
        userIdentifier: row.user_id || row.anonymous_id,
      },
    });
  } catch (error) {
    console.error('Admin feedback detail query failed:', error.message);
    res.status(500).json({ error: 'Feedback details could not be loaded.' });
  }
});

app.patch('/api/admin/feedback/:id', requireAdmin, (req, res) => {
  try {
    if (!validAdminOrigin(req)) return res.status(403).json({ error: 'Request origin is not allowed.' });
    const { status, adminNote } = req.body || {};
    if (status !== undefined && !['New', 'Reviewed', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid feedback status.' });
    }
    if (adminNote !== undefined && (typeof adminNote !== 'string' || adminNote.length > 5000)) {
      return res.status(400).json({ error: 'Internal notes must be 5,000 characters or fewer.' });
    }
    const existing = database.prepare('SELECT * FROM feedback WHERE feedback_id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Feedback record not found.' });
    database.prepare(`
      UPDATE feedback
      SET status = ?, admin_note = ?, updated_at = ?
      WHERE feedback_id = ?
    `).run(
      status ?? existing.status,
      adminNote ?? existing.admin_note,
      new Date().toISOString(),
      req.params.id
    );
    const updated = database.prepare('SELECT * FROM feedback WHERE feedback_id = ?').get(req.params.id);
    res.json({ feedback: parseFeedbackRow(updated, { includePrivate: true }) });
  } catch (error) {
    console.error('Admin feedback update failed:', error.message);
    res.status(500).json({ error: 'Feedback record could not be updated.' });
  }
});

app.delete('/api/admin/feedback/:id', requireAdmin, (req, res) => {
  try {
    if (!validAdminOrigin(req)) return res.status(403).json({ error: 'Request origin is not allowed.' });
    const result = database.prepare('DELETE FROM feedback WHERE feedback_id = ?').run(req.params.id);
    if (!result.changes) return res.status(404).json({ error: 'Feedback record not found.' });
    res.json({ success: true });
  } catch (error) {
    console.error('Admin feedback delete failed:', error.message);
    res.status(500).json({ error: 'Feedback record could not be deleted.' });
  }
});

// ==========================================
// SCHEDULED TASKS BACKEND PERSISTENCE
// ==========================================

app.get('/api/scheduled', (req, res) => {
  const tasks = loadScheduled();
  res.json({ tasks });
});

app.post('/api/scheduled', (req, res) => {
  const { tasks } = req.body;
  if (Array.isArray(tasks)) {
    saveScheduled(tasks);
    return res.json({ success: true, tasks });
  }
  res.status(400).json({ error: 'Tasks array required' });
});

app.listen(PORT, () => {
  console.log(`ChatBot AI Backend Server running on http://localhost:${PORT}`);
});
