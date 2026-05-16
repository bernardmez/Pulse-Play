import Groq from 'groq-sdk';
import { Router } from 'express';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();
const MAX_CHAT_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_RECOMMENDATIONS = 6;

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.content === 'string')
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_CHAT_MESSAGES);
}

function toPodcastSong(ep) {
  return {
    song_id: `ep_${ep.episode_id}`,
    title: ep.episode_title,
    artist_name: ep.title,
    album_title: `S${ep.season_number ?? 1} / E${ep.episode_number ?? 1}`,
    duration: ep.duration,
    audio_url: ep.audio_url,
    genre: ep.category,
    play_count: ep.play_count,
    is_podcast: true,
  };
}

function fallbackReply(lastUserText, songs, podcastEps, reason = '') {
  const lowered = lastUserText.toLowerCase();
  const wantsPodcast = /podcast|episode|talk|interview/.test(lowered);
  const picked = wantsPodcast && podcastEps.length > 0
    ? podcastEps.slice(0, 3).map(toPodcastSong)
    : songs.slice(0, 3);

  const names = picked.map((item) => `"${item.title}"`).join(', ');
  const helper = reason ? ' The AI service is busy, so I used your Pulse Play library directly.' : '';
  const reply = picked.length > 0
    ? `I found a few strong picks for you: ${names}.${helper}`
    : `I could not find a matching track right now.${helper || ' Try another mood, artist, or genre.'}`;

  return { reply, songs: picked };
}

async function fetchCatalogSafely(lastUserText) {
  const [songsResult, podcastResult] = await Promise.allSettled([
    fetchRelevantSongs(lastUserText),
    fetchRelevantPodcasts(lastUserText),
  ]);

  if (songsResult.status === 'rejected') {
    console.error('Chat songs lookup error:', songsResult.reason?.message ?? songsResult.reason);
  }
  if (podcastResult.status === 'rejected') {
    console.error('Chat podcasts lookup error:', podcastResult.reason?.message ?? podcastResult.reason);
  }

  return {
    songs: songsResult.status === 'fulfilled' ? songsResult.value : [],
    podcastEps: podcastResult.status === 'fulfilled' ? podcastResult.value : [],
  };
}

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

  let keywordMatches = [];
  if (keyword.length > 1) {
    const like = `%${keyword}%`;
    const [rows] = await pool.query(
      `SELECT s.song_id, s.title, s.genre, s.duration, s.play_count, s.audio_url,
              a.name AS artist_name, al.title AS album_title, 'song' AS type
       FROM songs s
       JOIN artists a ON s.artist_id = a.artist_id
       LEFT JOIN albums al ON s.album_id = al.album_id
       WHERE s.title LIKE ? OR a.name LIKE ? OR s.genre LIKE ?
       ORDER BY s.play_count DESC LIMIT 15`,
      [like, like, like],
    );
    keywordMatches = rows;
  }

  const seen = new Set();
  const all = [];
  for (const song of [...keywordMatches, ...trending]) {
    if (!seen.has(song.song_id)) {
      seen.add(song.song_id);
      all.push(song);
    }
  }
  return all;
}

async function fetchRelevantPodcasts(userMessage) {
  const keyword = (userMessage || '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const limit = keyword.length > 1 ? 12 : 10;
  const params = [];
  let whereClause = '';

  if (keyword.length > 1) {
    const like = `%${keyword}%`;
    whereClause = 'WHERE p.title LIKE ? OR p.category LIKE ? OR p.host LIKE ? OR pe.title LIKE ? OR pe.description LIKE ?';
    params.push(like, like, like, like, like);
  }
  params.push(limit);

  const [podcasts] = await pool.query(
    `SELECT p.podcast_id, p.title, p.host, p.category, p.followers_count,
            pe.episode_id, pe.title AS episode_title, pe.description, pe.duration,
            pe.episode_number, pe.season_number, pe.play_count, pe.audio_url
     FROM podcasts p
     JOIN podcast_episodes pe ON pe.podcast_id = p.podcast_id
     ${whereClause}
     ORDER BY pe.play_count DESC LIMIT ?`,
    params,
  );
  return podcasts;
}

router.post('/', async (req, res) => {
  const { messages, context } = req.body;
  const safeMessages = cleanMessages(messages);
  if (safeMessages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  try {
    const lastUserText = [...safeMessages].reverse().find((message) => message.role === 'user')?.content ?? '';
    const { songs, podcastEps } = await fetchCatalogSafely(lastUserText);

    if (!env.GROQ_API_KEY) {
      return res.json(fallbackReply(lastUserText, songs, podcastEps, 'missing GROQ_API_KEY'));
    }

    const groq = new Groq({ apiKey: env.GROQ_API_KEY });

    const catalog = songs.map((song) => ({
      id: `s${song.song_id}`,
      title: song.title,
      artist: song.artist_name,
      genre: song.genre,
      type: 'song',
    }));
    const podcastCatalog = podcastEps.map((episode) => ({
      id: `p${episode.episode_id}`,
      title: episode.episode_title,
      show: episode.title,
      host: episode.host,
      genre: episode.category,
      type: 'podcast',
    }));

    let nowPlayingNote = '';
    if (context?.nowPlaying) {
      const { title, artist, genre } = context.nowPlaying;
      nowPlayingNote = `\nThe user is currently listening to "${title}" by ${artist} (${genre}). You can reference this naturally.`;
    }

    const systemPrompt = `You are Pulse - a friendly, passionate AI music and podcast companion inside Pulse Play.

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
        ...safeMessages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    const songsMatch = raw.match(/SONGS:\[([^\]]*)\]/);
    const recommendedSongs = [];

    if (songsMatch && songsMatch[1].trim()) {
      const songMap = new Map(songs.map((song) => [song.song_id, song]));
      const epMap = new Map(podcastEps.map((episode) => [episode.episode_id, episode]));
      const seenRecommendations = new Set();
      const tokens = songsMatch[1].split(',').map((token) => token.trim()).filter(Boolean);

      for (const token of tokens) {
        if (recommendedSongs.length >= MAX_RECOMMENDATIONS) break;
        if (seenRecommendations.has(token)) continue;
        seenRecommendations.add(token);

        if (token.startsWith('s')) {
          const song = songMap.get(parseInt(token.slice(1), 10));
          if (song) recommendedSongs.push(song);
        } else if (token.startsWith('p')) {
          const episode = epMap.get(parseInt(token.slice(1), 10));
          if (episode) recommendedSongs.push(toPodcastSong(episode));
        }
      }
    }

    const reply = raw.replace(/^\s*SONGS:\[[^\]]*\]\s*$/gim, '').trim();
    return res.json({ reply: reply || 'Here are a few picks I think fit.', songs: recommendedSongs });
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.error('Chat route error:', msg);

    try {
      const lastUserText = [...cleanMessages(req.body?.messages)].reverse().find((message) => message.role === 'user')?.content ?? '';
      const { songs, podcastEps } = await fetchCatalogSafely(lastUserText);
      return res.json(fallbackReply(lastUserText, songs, podcastEps, msg));
    } catch (fallbackErr) {
      console.error('Chat fallback error:', fallbackErr?.message ?? fallbackErr);
      return res.status(500).json({ error: 'Chat is temporarily unavailable. Please try again in a moment.' });
    }
  }
});

export default router;
