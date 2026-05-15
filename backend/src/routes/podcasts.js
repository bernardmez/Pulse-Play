import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// GET /api/podcasts
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM podcasts ORDER BY followers_count DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/podcasts/:id — podcast + episodes
router.get('/:id', async (req, res) => {
  try {
    const [[podcast]] = await pool.query(
      'SELECT * FROM podcasts WHERE podcast_id = ?',
      [req.params.id],
    );
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });

    const [episodes] = await pool.query(
      'SELECT * FROM podcast_episodes WHERE podcast_id = ? ORDER BY season_number, episode_number',
      [req.params.id],
    );

    res.json({ ...podcast, episodes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
