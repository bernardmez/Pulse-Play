import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireSelf, requirePlaylistOwner } from '../middleware/ownership.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createPlaylistSchema, addSongSchema } from '../schemas/playlistSchemas.js';

const router = Router();

router.get('/user/:userId', authenticateToken, requireSelf, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM user_playlist_details WHERE user_id = ? ORDER BY created_at DESC',
    [req.params.userId]
  );
  res.json(rows);
}));

router.post('/', authenticateToken, validate(createPlaylistSchema), asyncHandler(async (req, res) => {
  const { title, description, isPublic } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO playlists (title, description, user_id, is_public) VALUES (?, ?, ?, ?)',
    [title, description || '', req.user.userId, isPublic !== false]
  );
  res.status(201).json({ message: 'Playlist created', playlistId: result.insertId });
}));

router.post('/:playlistId/songs', authenticateToken, requirePlaylistOwner,
  validate(addSongSchema), asyncHandler(async (req, res) => {
    await pool.execute('CALL add_song_to_playlist(?, ?)', [req.params.playlistId, req.body.songId]);
    res.json({ message: 'Song added' });
  })
);

router.delete('/:playlistId/songs/:songId', authenticateToken, requirePlaylistOwner,
  asyncHandler(async (req, res) => {
    await pool.execute('CALL remove_song_from_playlist(?, ?)',
      [req.params.playlistId, req.params.songId]);
    res.json({ message: 'Song removed' });
  })
);

router.put('/:playlistId', authenticateToken, requirePlaylistOwner,
  asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    await pool.execute(
      'UPDATE playlists SET title = ?, description = ? WHERE playlist_id = ?',
      [title.trim(), description || '', req.params.playlistId]
    );
    res.json({ message: 'Playlist updated' });
  })
);

router.delete('/:playlistId', authenticateToken, requirePlaylistOwner,
  asyncHandler(async (req, res) => {
    await pool.execute('DELETE FROM playlists WHERE playlist_id = ?', [req.params.playlistId]);
    res.json({ message: 'Playlist deleted' });
  })
);

export default router;
