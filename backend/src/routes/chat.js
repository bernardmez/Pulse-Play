import Groq from 'groq-sdk';
import { Router } from 'express';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

async function fetchRelevantSongs(userMessage) {
  const keyword = (userMessage || '').replace(/[^a-zA-Z0-9 ]/g, '').trim();

  const [trending] = await pool.query(
    `SELECT s.song_id, s.title, s.genre, s.duration, s.play_count, s.audio_url,
            a.name AS artist_name, al.title AS album_title, 'song' AS type
     FROM songs s
     JOIN artists a ON s.artist_id = a.artist_id
     LEFT JOIN albums al ON s.album_id = al.album_id
     ORDER BY s.play_count DESC LIMIT 20`,
  );

  let keyword_matches = [];
  if (keyword.length > 1) {
    const [rows] = await pool.query(
      `SELECT s.song_id, s.title, s.genre, s.duration, s.play_count, s.audio_url,
              a.name AS artist_name, al.title AS album_title, 'song' AS type
       FROM songs s
       JOIN artists a ON s.artist_id = a.artist_id
       LEFT JOIN albums al ON s.album_id = al.album_id
       WHERE s.title LIKE ? OR a.name LIKE ? OR s.genre LIKE ?
       ORDER BY s.play_count DESC LIMIT 15`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
    );
    keyword_matches = rows;
  }

  const seen = new Set();
  const all = [];
  for (const s of [...keyword_matches, ...trending]) {
    if (!seen.has(s.song_id)) { seen.add(s.song_id); all.push(s); }
  }
  return all;
}

async function fetchRelevantPodcasts(userMessage) {
  const keyword = (userMessage || '').replace(/[^a-zA-Z0-9 ]/g, '').trim();

  const [podcasts] = await pool.query(
    `SELECT p.podcast_id, p.title, p.host, p.genre, p.followers_count,
            pe.episode_id, pe.title AS episode_title, pe.description, pe.duration,
            pe.episode_number, pe.season_number, pe.play_count, pe.audio_url
     FROM podcasts p
     JOIN podcast_episodes pe ON pe.podcast_id = p.podcast_id
     ${keyword.length > 1 ? 'WHERE p.title LIKE ? OR p.genre LIKE ? OR pe.title LIKE ?' : ''}
     ORDER BY pe.play_count DESC LIMIT 10`,
    keyword.length > 1 ? [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`] : [],
  );
  return podcasts;
}

router.post('/', async (req, res) => {
  if (!env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'Chat is not configured. Add GROQ_API_KEY to backend/.env' });
  }

  const { messages, context } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const groq = new Groq({ apiKey: env.GROQ_API_KEY });

  try {
  // Fetch songs relevant to the latest user message
  const lastUserText = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const [songs, podcastEps] = await Promise.all([
    fetchRelevantSongs(lastUserText),
    fetchRelevantPodcasts(lastUserText),
  ]);

  const catalog = songs.map((s) => ({
    id: `s${s.song_id}`, title: s.title, artist: s.artist_name, genre: s.genre, type: 'song',
  }));
  const podcastCatalog = podcastEps.map((e) => ({
    id: `p${e.episode_id}`, title: e.episode_title, show: e.title, host: e.host,
    genre: e.genre, type: 'podcast',
  }));

  let nowPlayingNote = '';
  if (context?.nowPlaying) {
    const { title, artist, genre } = context.nowPlaying;
    nowPlayingNote = `\nThe user is currently listening to "${title}" by ${artist} (${genre}). You can reference this naturally.`;
  }

  const systemPrompt = `You are Pulse — a friendly, passionate AI music and podcast companion inside Pulse Play.

You can chat about anything music-related: genres, artists, history, mood, recommendations, music theory, fun facts. You also help users discover podcasts about music.

Songs available (id starts with "s"):
${JSON.stringify(catalog)}

Podcast episodes available (id starts with "p"):
${JSON.stringify(podcastCatalog)}

When recommending songs or podcast episodes, end your message with this exact line:
SONGS:[id1,id2,id3]

Use the catalog ids (e.g. s5, p3). Only include this line when actively recommending content to play. Omit it for general chat.${nowPlayingNote}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const raw = response.choices?.[0]?.message?.content ?? '';

    const songsMatch = raw.match(/SONGS:\[([^\]]*)\]/);
    let recommendedSongs = [];
    if (songsMatch && songsMatch[1].trim()) {
      const songMap = new Map(songs.map((s) => [s.song_id, s]));
      const epMap = new Map(podcastEps.map((e) => [e.episode_id, e]));

      const tokens = songsMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
      for (const token of tokens) {
        if (token.startsWith('s')) {
          const song = songMap.get(parseInt(token.slice(1), 10));
          if (song) recommendedSongs.push(song);
        } else if (token.startsWith('p')) {
          const ep = epMap.get(parseInt(token.slice(1), 10));
          if (ep) {
            recommendedSongs.push({
              song_id: `ep_${ep.episode_id}`,
              title: ep.episode_title,
              artist_name: ep.title,
              album_title: `S${ep.season_number} · E${ep.episode_number}`,
              duration: ep.duration,
              audio_url: ep.audio_url,
              genre: ep.genre,
              play_count: ep.play_count,
              is_podcast: true,
            });
          }
        }
      }
    }

    // Strip the SONGS line from the displayed reply
    const reply = raw.replace(/\nSONGS:\[[^\]]*\]/g, '').replace(/SONGS:\[[^\]]*\]/g, '').trim();

    return res.json({ reply, songs: recommendedSongs });
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.error('Chat route error:', msg);
    res.status(500).json({ error: msg });
  }
});

export default router;
