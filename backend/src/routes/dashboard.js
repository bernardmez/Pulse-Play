import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireSelf } from '../middleware/ownership.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/:userId', authenticateToken, requireSelf, asyncHandler(async (req, res) => {
  const id = req.params.userId;
  const [[listeningTime], [favoriteGenre], [playlists], [favorites]] = await Promise.all([
    pool.execute('SELECT SUM(play_duration) as total_seconds FROM listening_history WHERE user_id = ?', [id]),
    pool.execute(`SELECT s.genre, COUNT(*) as count FROM listening_history lh
      JOIN songs s ON lh.song_id = s.song_id WHERE lh.user_id = ?
      GROUP BY s.genre ORDER BY count DESC LIMIT 1`, [id]),
    pool.execute('SELECT COUNT(*) as count FROM playlists WHERE user_id = ?', [id]),
    pool.execute('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', [id]),
  ]);
  res.json({
    totalListeningTime: listeningTime[0].total_seconds || 0,
    favoriteGenre: favoriteGenre[0]?.genre || 'Unknown',
    totalPlaylists: playlists[0].count,
    totalFavorites: favorites[0].count,
  });
}));

export default router;
