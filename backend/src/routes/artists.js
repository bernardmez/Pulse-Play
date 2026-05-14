import { Router } from 'express';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM artist_statistics ORDER BY total_plays DESC LIMIT 50'
  );
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new AppError('Invalid id', 400, 'INVALID_PARAM');

  const [artists] = await pool.execute('SELECT * FROM artists WHERE artist_id = ?', [id]);
  if (artists.length === 0) throw new AppError('Artist not found', 404, 'NOT_FOUND');

  const [songs] = await pool.execute(`
    SELECT s.song_id, s.title, s.duration, s.genre, s.play_count, s.likes_count, s.audio_url,
           al.title AS album_title, al.cover_image
    FROM songs s LEFT JOIN albums al ON s.album_id = al.album_id
    WHERE s.artist_id = ? ORDER BY s.play_count DESC
  `, [id]);

  const [albums] = await pool.execute(
    'SELECT * FROM albums WHERE artist_id = ? ORDER BY release_date DESC', [id]
  );

  res.json({ artist: artists[0], songs, albums });
}));

export default router;
