import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  let dbStatus = 'ok';
  try {
    await pool.execute('SELECT 1');
  } catch {
    dbStatus = 'error';
  }
  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
