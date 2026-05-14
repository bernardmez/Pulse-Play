import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { recordPlaySchema } from '../schemas/historySchemas.js';

const router = Router();

router.post('/', authenticateToken, validate(recordPlaySchema), asyncHandler(async (req, res) => {
  const { songId, duration, device } = req.body;
  await pool.execute('CALL record_song_play(?, ?, ?, ?)',
    [req.user.userId, songId, duration, device]);
  res.json({ message: 'Play recorded' });
}));

export default router;
