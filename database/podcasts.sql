-- ============================================================
-- PULSE PLAY — Podcasts add-on
-- Run this after schema.sql to enable the podcast feature
-- ============================================================

CREATE TABLE IF NOT EXISTS podcasts (
  podcast_id      INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200)  NOT NULL,
  description     TEXT,
  host            VARCHAR(150)  NOT NULL,
  genre           VARCHAR(100),
  cover_image     VARCHAR(500),
  followers_count INT           NOT NULL DEFAULT 0,
  total_episodes  INT           NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS podcast_episodes (
  episode_id      INT AUTO_INCREMENT PRIMARY KEY,
  podcast_id      INT           NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  description     TEXT,
  duration        INT           NOT NULL DEFAULT 0,
  audio_url       VARCHAR(500),
  episode_number  INT           NOT NULL DEFAULT 1,
  season_number   INT           NOT NULL DEFAULT 1,
  play_count      INT           NOT NULL DEFAULT 0,
  published_at    DATE,
  FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE
);

-- ---- Podcasts ---------------------------------------------------------------
INSERT INTO podcasts (title, description, host, genre, followers_count, total_episodes) VALUES
  ('The Music Theory Lab',
   'Deep dives into music theory, composition, and the science of sound. From scales to symphonies.',
   'Dr. Sarah Chen', 'Educational', 12400, 4),

  ('Hip-Hop Chronicles',
   'Exploring the history, culture, and evolution of hip-hop — from the Bronx to the world stage.',
   'Marcus Williams', 'Hip-Hop', 38900, 4),

  ('Jazz Stories',
   'Intimate conversations with jazz musicians and historians about the soul of American music.',
   'Elena Russo', 'Jazz', 9200, 3),

  ('Electronic Frontier',
   'Inside the world of electronic music production — synths, drops, and the artists behind them.',
   'DJ Neon', 'Electronic', 22100, 4),

  ('Pop Decoded',
   'Breaking down the biggest pop hits: why they work, what makes them catchy, and who made them.',
   'Jamie Rivers', 'Pop', 51300, 3);

-- ---- Episodes: The Music Theory Lab (podcast_id = 1) -----------------------
INSERT INTO podcast_episodes (podcast_id, title, description, duration, episode_number, season_number, play_count, published_at) VALUES
  (1, 'Why Minor Keys Feel Sad',
   'We explore the psychology behind minor scales and why they evoke melancholy across cultures.',
   2580, 1, 1, 8400, '2024-01-15'),
  (1, 'The Circle of Fifths Explained',
   'The most powerful tool in music theory, broken down from beginners to pros.',
   3120, 2, 1, 6200, '2024-02-01'),
  (1, 'Polyrhythm and World Music',
   'How African, Latin, and Asian traditions use complex rhythms that Western music rarely touches.',
   2940, 3, 1, 4800, '2024-02-20'),
  (1, 'Why Pop Songs Are 3 Minutes Long',
   'The surprising history behind the perfect pop song length — from vinyl records to streaming algorithms.',
   2340, 4, 1, 9100, '2024-03-10');

-- ---- Episodes: Hip-Hop Chronicles (podcast_id = 2) -------------------------
INSERT INTO podcast_episodes (podcast_id, title, description, duration, episode_number, season_number, play_count, published_at) VALUES
  (2, 'The Birth of Hip-Hop: 1973',
   'DJ Kool Herc, a turntable, and a party in the Bronx that changed music forever.',
   3600, 1, 1, 24300, '2024-01-10'),
  (2, 'Kendrick Lamar: The Pulitzer Prize Rapper',
   'How Kendrick went from Compton to winning the most prestigious literary award in America.',
   4200, 2, 1, 31000, '2024-01-28'),
  (2, 'The Golden Era: 90s Hip-Hop',
   'Notorious B.I.G., Tupac, Nas, Jay-Z — the decade that defined a genre.',
   3900, 3, 1, 19800, '2024-02-15'),
  (2, 'Trap Music and the Atlanta Sound',
   'How Atlanta redefined hip-hop in the 2000s and produced the biggest names in rap today.',
   3300, 4, 1, 22100, '2024-03-05');

-- ---- Episodes: Jazz Stories (podcast_id = 3) --------------------------------
INSERT INTO podcast_episodes (podcast_id, title, description, duration, episode_number, season_number, play_count, published_at) VALUES
  (3, 'Miles Davis and the Birth of Cool',
   'The genius, the controversy, and the legacy of the most influential jazz musician of all time.',
   4800, 1, 1, 7200, '2024-01-20'),
  (3, 'Norah Jones: Jazz Goes Pop',
   'How a jazz pianist from Brooklyn became one of the best-selling artists of the 2000s.',
   3600, 2, 1, 5900, '2024-02-10'),
  (3, 'The Jazz Club Experience',
   'What makes a great jazz venue — acoustics, atmosphere, and the magic of live improvisation.',
   2700, 3, 1, 4100, '2024-03-01');

-- ---- Episodes: Electronic Frontier (podcast_id = 4) ------------------------
INSERT INTO podcast_episodes (podcast_id, title, description, duration, episode_number, season_number, play_count, published_at) VALUES
  (4, 'Synthesizers: From Moog to Modular',
   'The history of the synthesizer and how it transformed every genre of music.',
   3480, 1, 1, 15600, '2024-01-12'),
  (4, 'Daft Punk: The Robots Who Changed Music',
   'Inside the helmets, the riffs, and the legacy of the most iconic electronic duo ever.',
   3840, 2, 1, 28400, '2024-02-03'),
  (4, 'The Drop: Why EDM Hits So Hard',
   'The psychology of the build-up and drop — why your brain craves the release.',
   2880, 3, 1, 19200, '2024-02-22'),
  (4, 'Ambient Music and Brain Science',
   'How Brian Eno invented a genre and why ambient music is the ultimate focus tool.',
   3240, 4, 1, 11800, '2024-03-15');

-- ---- Episodes: Pop Decoded (podcast_id = 5) ---------------------------------
INSERT INTO podcast_episodes (podcast_id, title, description, duration, episode_number, season_number, play_count, published_at) VALUES
  (5, 'The Anatomy of a Hit Song',
   'What separates a chart-topper from a flop — verse, chorus, hook, and the science of catchiness.',
   2760, 1, 1, 42100, '2024-01-08'),
  (5, 'Taylor Swift: The Marketing Genius',
   'Beyond the music — how Taylor Swift became the world''s biggest pop star through storytelling and strategy.',
   4320, 2, 1, 67300, '2024-01-25'),
  (5, 'Streaming Changed Everything',
   'How Spotify, Apple Music, and YouTube killed the album and created the age of the single.',
   3000, 3, 1, 35800, '2024-02-18');
