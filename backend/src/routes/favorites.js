import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireSelf } from '../middleware/ownership.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

router.get('/:userId', authenticateToken, requireSelf, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT s.song_id, s.title, s.duration, s.genre, s.play_count, s.audio_url,
           a.name AS artist_name, al.cover_image, uf.added_at
    FROM user_favorites uf
    INNER JOIN songs s ON uf.song_id = s.song_id
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
    WHERE uf.user_id = ? ORDER BY uf.added_at DESC
  `, [req.params.userId]);
  res.json(rows);
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const songId = parseInt(req.body.songId, 10);
  if (isNaN(songId)) throw new AppError('Invalid songId', 400, 'INVALID_PARAM');
  try {
    await pool.execute('INSERT INTO user_favorites (user_id, song_id) VALUES (?, ?)',
      [req.user.userId, songId]);
    res.json({ message: 'Added to favorites' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new AppError('Already in favorites', 409, 'DUPLICATE');
    throw e;
  }
}));

router.delete('/:songId', authenticateToken, asyncHandler(async (req, res) => {
  const songId = parseInt(req.params.songId, 10);
  if (isNaN(songId)) throw new AppError('Invalid songId', 400, 'INVALID_PARAM');
  await pool.execute('DELETE FROM user_favorites WHERE user_id = ? AND song_id = ?',
    [req.user.userId, songId]);
  res.json({ message: 'Removed from favorites' });
}));

export default router;
