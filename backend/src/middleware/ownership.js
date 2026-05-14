import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireSelf = asyncHandler(async (req, _res, next) => {
  const paramId = parseInt(req.params.userId, 10);
  if (isNaN(paramId)) throw new AppError('Invalid user id', 400, 'INVALID_PARAM');
  if (paramId !== req.user.userId)
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  next();
});

export const requirePlaylistOwner = asyncHandler(async (req, _res, next) => {
  const playlistId = parseInt(req.params.playlistId, 10);
  if (isNaN(playlistId)) throw new AppError('Invalid playlist id', 400, 'INVALID_PARAM');

  const [rows] = await pool.execute(
    'SELECT user_id FROM playlists WHERE playlist_id = ?',
    [playlistId]
  );
  if (rows.length === 0) throw new AppError('Playlist not found', 404, 'NOT_FOUND');
  if (rows[0].user_id !== req.user.userId)
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  next();
});
