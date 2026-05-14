import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/:songId', authenticateToken, asyncHandler(async (req, res) => {
  const songId = parseInt(req.params.songId, 10);
  if (isNaN(songId)) throw new AppError('Invalid songId', 400, 'INVALID_PARAM');

  const [rows] = await pool.execute(
    'SELECT audio_url, title FROM songs WHERE song_id = ?', [songId]
  );
  if (rows.length === 0) throw new AppError('Song not found', 404, 'NOT_FOUND');

  const { audio_url } = rows[0];
  if (!audio_url) throw new AppError('No audio available', 404, 'NO_AUDIO');

  // If audio_url is an external URL, redirect
  if (audio_url.startsWith('http')) {
    return res.redirect(audio_url);
  }

  // Local file streaming with Range support
  const filePath = path.resolve('audio', audio_url);
  if (!fs.existsSync(filePath)) throw new AppError('Audio file not found', 404, 'NO_AUDIO');

  const stat = fs.statSync(filePath);
  const total = stat.size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : total - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': 'audio/mpeg',
    });
    fs.createReadStream(filePath).pipe(res);
  }
}));

export default router;
