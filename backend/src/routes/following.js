import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireSelf } from '../middleware/ownership.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

router.get('/:userId', authenticateToken, requireSelf, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT a.*, ufa.followed_at FROM user_following_artists ufa
    INNER JOIN artists a ON ufa.artist_id = a.artist_id
    WHERE ufa.user_id = ? ORDER BY ufa.followed_at DESC
  `, [req.params.userId]);
  res.json(rows);
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const artistId = parseInt(req.body.artistId, 10);
  if (isNaN(artistId)) throw new AppError('Invalid artistId', 400, 'INVALID_PARAM');
  try {
    await pool.execute('INSERT INTO user_following_artists (user_id, artist_id) VALUES (?, ?)',
      [req.user.userId, artistId]);
    res.json({ message: 'Following artist' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new AppError('Already following', 409, 'DUPLICATE');
    throw e;
  }
}));

router.delete('/:artistId', authenticateToken, asyncHandler(async (req, res) => {
  const artistId = parseInt(req.params.artistId, 10);
  if (isNaN(artistId)) throw new AppError('Invalid artistId', 400, 'INVALID_PARAM');
  await pool.execute('DELETE FROM user_following_artists WHERE user_id = ? AND artist_id = ?',
    [req.user.userId, artistId]);
  res.json({ message: 'Unfollowed artist' });
}));

export default router;
