import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/listening-history/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT lh.history_id, lh.played_at, lh.play_duration, lh.completed, lh.device_type,
           s.song_id, s.title AS song_title, s.duration AS song_duration, s.genre,
           a.artist_id, a.name AS artist_name,
           al.album_id, al.title AS album_title, al.cover_image
    FROM listening_history lh
    INNER JOIN songs s ON lh.song_id = s.song_id
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
    WHERE lh.user_id = ? ORDER BY lh.played_at DESC LIMIT 50
  `, [req.params.userId]);
  res.json(rows);
}));

router.get('/playlist-details/:playlistId', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT p.playlist_id, p.title AS playlist_title, p.description,
           p.total_tracks, p.total_duration, u.name AS owner_name,
           ps.position, s.song_id, s.title AS song_title, s.duration, s.genre,
           a.name AS artist_name, al.title AS album_title, al.cover_image
    FROM playlists p
    INNER JOIN users u ON p.user_id = u.user_id
    INNER JOIN playlist_songs ps ON p.playlist_id = ps.playlist_id
    INNER JOIN songs s ON ps.song_id = s.song_id
    INNER JOIN artists a ON s.artist_id = a.artist_id
    LEFT JOIN albums al ON s.album_id = al.album_id
    WHERE p.playlist_id = ? ORDER BY ps.position ASC
  `, [req.params.playlistId]);
  res.json(rows);
}));

router.get('/active-listeners', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(`
    SELECT u.user_id, u.name, u.email, u.subscription_type,
           COUNT(DISTINCT lh.song_id) AS unique_songs_listened,
           COUNT(lh.history_id) AS total_plays
    FROM users u INNER JOIN listening_history lh ON u.user_id = lh.user_id
    GROUP BY u.user_id, u.name, u.email, u.subscription_type
    HAVING COUNT(DISTINCT lh.song_id) > (
      SELECT AVG(song_count) FROM (
        SELECT COUNT(DISTINCT song_id) AS song_count FROM listening_history GROUP BY user_id
      ) AS avg_songs
    ) ORDER BY unique_songs_listened DESC
  `);
  res.json(rows);
}));

router.get('/genre-statistics', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(`
    SELECT s.genre, COUNT(DISTINCT s.song_id) AS total_songs,
           COUNT(DISTINCT s.artist_id) AS total_artists,
           SUM(s.play_count) AS total_plays, AVG(s.duration) AS avg_duration,
           MAX(s.play_count) AS most_played_count, SUM(s.likes_count) AS total_likes
    FROM songs s WHERE s.genre IS NOT NULL
    GROUP BY s.genre HAVING COUNT(DISTINCT s.song_id) > 0
    ORDER BY total_plays DESC
  `);
  res.json(rows);
}));

router.get('/followed-artists-content/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT 'album' AS content_type, al.album_id AS content_id, al.title,
           al.release_date, a.name AS artist_name
    FROM user_following_artists ufa
    INNER JOIN artists a ON ufa.artist_id = a.artist_id
    INNER JOIN albums al ON a.artist_id = al.artist_id
    WHERE ufa.user_id = ?
    UNION
    SELECT 'song' AS content_type, s.song_id AS content_id, s.title,
           s.release_date, a.name AS artist_name
    FROM user_following_artists ufa
    INNER JOIN artists a ON ufa.artist_id = a.artist_id
    INNER JOIN songs s ON a.artist_id = s.artist_id
    WHERE ufa.user_id = ?
    ORDER BY release_date DESC LIMIT 50
  `, [req.params.userId, req.params.userId]);
  res.json(rows);
}));

export default router;
