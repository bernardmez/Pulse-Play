import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import healthRouter from './src/routes/health.js';
import authRouter from './src/routes/auth.js';
import songsRouter from './src/routes/songs.js';
import artistsRouter from './src/routes/artists.js';
import albumsRouter from './src/routes/albums.js';
import playlistsRouter from './src/routes/playlists.js';
import favoritesRouter from './src/routes/favorites.js';
import historyRouter from './src/routes/history.js';
import subscriptionsRouter from './src/routes/subscriptions.js';
import recommendationsRouter from './src/routes/recommendations.js';
import followingRouter from './src/routes/following.js';
import dashboardRouter from './src/routes/dashboard.js';
import queriesRouter from './src/routes/queries.js';
import streamRouter from './src/routes/stream.js';
import chatRouter from './src/routes/chat.js';
import podcastsRouter from './src/routes/podcasts.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allowlist from env
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Logging
app.use(pinoHttp({ logger }));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, try again later', code: 'RATE_LIMITED' },
  skip: () => env.NODE_ENV === 'test',
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, try again later', code: 'RATE_LIMITED' },
  skip: () => env.NODE_ENV === 'test',
});

// Routes
app.use('/health', healthRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api', apiLimiter);
app.use('/api/songs', songsRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/listening-history', historyRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/follow-artist', followingRouter);
app.use('/api/following', followingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/stream', streamRouter);
app.use('/api/chat', chatRouter);
app.use('/api/podcasts', podcastsRouter);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
