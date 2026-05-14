import { Router } from 'express';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(`
    SELECT al.*, a.name AS artist_name FROM albums al
    INNER JOIN artists a ON al.artist_id = a.artist_id
    ORDER BY al.release_date DESC LIMIT 50
  `);
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new AppError('Invalid id', 400, 'INVALID_PARAM');

  const [albums] = await pool.execute(`
    SELECT al.*, a.name AS artist_name, a.artist_id
    FROM albums al INNER JOIN artists a ON al.artist_id = a.artist_id
    WHERE al.album_id = ?
  `, [id]);
  if (albums.length === 0) throw new AppError('Album not found', 404, 'NOT_FOUND');

  const [songs] = await pool.execute(`
    SELECT song_id, title, duration, genre, play_count, likes_count, audio_url
    FROM songs WHERE album_id = ? ORDER BY song_id ASC
  `, [id]);

  res.json({ album: albums[0], songs });
}));

export default router;
