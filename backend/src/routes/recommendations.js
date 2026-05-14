import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireSelf } from '../middleware/ownership.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/:userId', authenticateToken, requireSelf, asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const [rows] = await pool.execute('CALL get_user_recommendations(?, ?)',
    [req.params.userId, limit]);
  res.json(rows[0]);
}));

export default router;
