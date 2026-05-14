import { Router } from 'express';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

router.get('/trending/all', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(`
    SELECT s.song_id, s.title, s.duration, s.genre, s.play_count, s.likes_count,
           s.audio_url, a.artist_id, a.name AS artist_name,
           al.album_id, al.title AS album_title, al.cover_image
    FROM songs s
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
    ORDER BY s.play_count DESC LIMIT 20
  `);
  res.json(rows);
}));

router.get('/search/:query', asyncHandler(async (req, res) => {
  const raw = req.params.query?.slice(0, 100) || '';
  const term = `%${raw}%`;
  const [rows] = await pool.execute(`
    SELECT s.song_id, s.title, s.duration, s.genre, s.play_count, s.audio_url,
           a.name AS artist_name, al.cover_image
    FROM songs s
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
    WHERE s.title LIKE ? OR a.name LIKE ? OR s.genre LIKE ? OR al.title LIKE ?
    ORDER BY s.play_count DESC LIMIT 50
  `, [term, term, term, term]);
  res.json(rows);
}));

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const genre = req.query.genre?.slice(0, 50) || null;

  let query = `
    SELECT s.song_id, s.title, s.duration, s.genre, s.play_count, s.likes_count,
           s.audio_url, a.artist_id, a.name AS artist_name,
           al.album_id, al.title AS album_title, al.cover_image
    FROM songs s
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
  `;
  const params = [];
  if (genre) { query += ' WHERE s.genre = ?'; params.push(genre); }
  query += ' ORDER BY s.play_count DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.execute(query, params);
  let countQ = 'SELECT COUNT(*) as total FROM songs';
  if (genre) countQ += ' WHERE genre = ?';
  const [countResult] = await pool.execute(countQ, genre ? [genre] : []);

  res.json({
    songs: rows,
    pagination: { page, limit, total: countResult[0].total, pages: Math.ceil(countResult[0].total / limit) },
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new AppError('Invalid id', 400, 'INVALID_PARAM');

  const [rows] = await pool.execute(`
    SELECT s.*, s.audio_url, a.name AS artist_name, a.genre AS artist_genre,
           al.title AS album_title, al.cover_image, al.release_date AS album_release_date
    FROM songs s
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
    WHERE s.song_id = ?
  `, [id]);

  if (rows.length === 0) throw new AppError('Song not found', 404, 'NOT_FOUND');
  res.json(rows[0]);
}));

export default router;
