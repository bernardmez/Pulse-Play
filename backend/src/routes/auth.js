import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

const router = Router();

// In-memory refresh token store. In production replace with Redis.
const revokedTokens = new Set();

function signAccess(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
}

function signRefresh(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',
  });
}

router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password, country } = req.body;

  const [existingUsers] = await pool.execute(
    'SELECT user_id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existingUsers.length > 0) {
    logger.warn({ email }, 'Registration attempt with existing email');
    throw new AppError('This email is already taken. Try another email.', 409, 'EMAIL_TAKEN');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, country) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, country || 'Unknown']
    );
    const userId = result.insertId;
    const accessToken = signAccess({ userId, email });
    const refreshToken = signRefresh({ userId, email });
    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      message: 'Registration successful',
      token: accessToken,
      user: { userId, name, email, subscriptionType: 'free' },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      logger.warn({ email }, 'Registration race with existing email');
      throw new AppError('This email is already taken. Try another email.', 409, 'EMAIL_TAKEN');
    }
    throw error;
  }
}));
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.execute(
    'SELECT user_id, name, email, password, subscription_type FROM users WHERE email = ?',
    [email]
  );

  const user = users[0];
  const valid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !valid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const payload = { userId: user.user_id, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);
  setRefreshCookie(res, refreshToken);

  res.json({
    message: 'Login successful',
    token: accessToken,
    user: {
      userId: user.user_id,
      name: user.name,
      email: user.email,
      subscriptionType: user.subscription_type,
    },
  });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token required', 401, 'NO_TOKEN');
  if (revokedTokens.has(token)) throw new AppError('Token revoked', 401, 'TOKEN_REVOKED');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  const accessToken = signAccess({ userId: payload.userId, email: payload.email });
  res.json({ token: accessToken });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) revokedTokens.add(token);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
}));

export default router;

