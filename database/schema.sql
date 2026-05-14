-- ============================================================
-- PULSE PLAY — Complete Database Setup
-- Run this file once to create everything from scratch.
-- Usage: mysql -u root -p < schema.sql
-- ============================================================

DROP DATABASE IF EXISTS pulse_play;
CREATE DATABASE pulse_play CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pulse_play;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE users (
  user_id         INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password        VARCHAR(255)  NOT NULL,
  subscription_type VARCHAR(50) NOT NULL DEFAULT 'free',
  country         VARCHAR(100)  NOT NULL DEFAULT 'Unknown',
  join_date       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
  artist_id       INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150)  NOT NULL,
  genre           VARCHAR(100),
  country         VARCHAR(100),
  profile_image   VARCHAR(500),
  verified        BOOLEAN       NOT NULL DEFAULT FALSE,
  followers_count INT           NOT NULL DEFAULT 0
);

CREATE TABLE albums (
  album_id        INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200)  NOT NULL,
  artist_id       INT           NOT NULL,
  cover_image     VARCHAR(500),
  release_date    DATE,
  total_tracks    INT           NOT NULL DEFAULT 0,
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

CREATE TABLE songs (
  song_id         INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200)  NOT NULL,
  duration        INT           NOT NULL DEFAULT 0,  -- seconds
  genre           VARCHAR(100),
  play_count      INT           NOT NULL DEFAULT 0,
  likes_count     INT           NOT NULL DEFAULT 0,
  audio_url       VARCHAR(500),
  artist_id       INT           NOT NULL,
  album_id        INT,
  release_date    DATE,
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
  FOREIGN KEY (album_id)  REFERENCES albums(album_id)  ON DELETE SET NULL
);

CREATE TABLE playlists (
  playlist_id     INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(100)  NOT NULL,
  description     TEXT          DEFAULT '',
  user_id         INT           NOT NULL,
  is_public       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_tracks    INT           NOT NULL DEFAULT 0,
  total_duration  INT           NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE playlist_songs (
  playlist_id     INT           NOT NULL,
  song_id         INT           NOT NULL,
  position        INT           NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE,
  FOREIGN KEY (song_id)     REFERENCES songs(song_id)         ON DELETE CASCADE
);

CREATE TABLE user_favorites (
  user_id         INT           NOT NULL,
  song_id         INT           NOT NULL,
  added_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, song_id),
  FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (song_id)  REFERENCES songs(song_id) ON DELETE CASCADE
);

CREATE TABLE user_following_artists (
  user_id         INT           NOT NULL,
  artist_id       INT           NOT NULL,
  followed_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, artist_id),
  FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

CREATE TABLE listening_history (
  history_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL,
  song_id         INT           NOT NULL,
  played_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  play_duration   INT           NOT NULL DEFAULT 0,
  completed       BOOLEAN       NOT NULL DEFAULT FALSE,
  device_type     VARCHAR(50)   NOT NULL DEFAULT 'web',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
);

CREATE TABLE subscriptions (
  subscription_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL,
  plan            VARCHAR(50)   NOT NULL,
  start_date      DATE          NOT NULL,
  end_date        DATE          NOT NULL,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW artist_statistics AS
SELECT
  a.artist_id,
  a.name,
  a.genre,
  a.country,
  a.profile_image,
  a.verified,
  a.followers_count,
  COALESCE(SUM(s.play_count), 0)    AS total_plays,
  COUNT(DISTINCT s.song_id)         AS total_songs,
  COUNT(DISTINCT al.album_id)       AS total_albums
FROM artists a
LEFT JOIN songs s  ON a.artist_id = s.artist_id
LEFT JOIN albums al ON a.artist_id = al.artist_id
GROUP BY a.artist_id, a.name, a.genre, a.country, a.profile_image, a.verified, a.followers_count;


CREATE VIEW user_playlist_details AS
SELECT
  p.playlist_id,
  p.title,
  p.description,
  p.user_id,
  p.is_public,
  p.created_at,
  p.total_tracks,
  p.total_duration,
  u.name AS owner_name
FROM playlists p
INNER JOIN users u ON p.user_id = u.user_id;


CREATE VIEW active_subscriptions AS
SELECT
  s.subscription_id,
  s.user_id,
  s.plan,
  s.start_date,
  s.end_date,
  s.price
FROM subscriptions s
WHERE s.end_date >= CURDATE();

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Add a song to a playlist
CREATE PROCEDURE add_song_to_playlist(IN p_playlist_id INT, IN p_song_id INT)
BEGIN
  DECLARE next_pos INT;
  DECLARE song_dur INT;

  SELECT COALESCE(MAX(position), 0) + 1 INTO next_pos
  FROM playlist_songs WHERE playlist_id = p_playlist_id;

  SELECT duration INTO song_dur FROM songs WHERE song_id = p_song_id;

  INSERT INTO playlist_songs (playlist_id, song_id, position)
  VALUES (p_playlist_id, p_song_id, next_pos);

  UPDATE playlists
  SET total_tracks   = total_tracks + 1,
      total_duration = total_duration + COALESCE(song_dur, 0)
  WHERE playlist_id = p_playlist_id;
END //


-- Remove a song from a playlist
CREATE PROCEDURE remove_song_from_playlist(IN p_playlist_id INT, IN p_song_id INT)
BEGIN
  DECLARE song_dur INT;
  SELECT duration INTO song_dur FROM songs WHERE song_id = p_song_id;

  DELETE FROM playlist_songs WHERE playlist_id = p_playlist_id AND song_id = p_song_id;

  UPDATE playlists
  SET total_tracks   = GREATEST(total_tracks - 1, 0),
      total_duration = GREATEST(total_duration - COALESCE(song_dur, 0), 0)
  WHERE playlist_id = p_playlist_id;
END //


-- Record a song play in listening history and increment play_count
CREATE PROCEDURE record_song_play(
  IN p_user_id  INT,
  IN p_song_id  INT,
  IN p_duration INT,
  IN p_device   VARCHAR(50)
)
BEGIN
  DECLARE song_length INT;
  SELECT duration INTO song_length FROM songs WHERE song_id = p_song_id;

  INSERT INTO listening_history (user_id, song_id, play_duration, device_type, completed)
  VALUES (
    p_user_id,
    p_song_id,
    p_duration,
    COALESCE(p_device, 'web'),
    (p_duration >= song_length * 0.8)
  );

  UPDATE songs SET play_count = play_count + 1 WHERE song_id = p_song_id;
END //


-- Personalized recommendations: songs from favourite genres/artists, excluding liked songs
CREATE PROCEDURE get_user_recommendations(IN p_user_id INT, IN p_limit INT)
BEGIN
  SELECT DISTINCT
    s.song_id, s.title, s.duration, s.genre,
    s.play_count, s.audio_url,
    a.name  AS artist_name,
    al.cover_image
  FROM songs s
  INNER JOIN artists a  ON s.artist_id = a.artist_id
  LEFT  JOIN albums  al ON s.album_id  = al.album_id
  WHERE s.song_id NOT IN (
      SELECT song_id FROM user_favorites WHERE user_id = p_user_id
  )
  AND (
    s.genre IN (
      SELECT s2.genre
      FROM listening_history lh
      JOIN songs s2 ON lh.song_id = s2.song_id
      WHERE lh.user_id = p_user_id
      GROUP BY s2.genre
    )
    OR
    s.artist_id IN (
      SELECT s2.artist_id
      FROM listening_history lh
      JOIN songs s2 ON lh.song_id = s2.song_id
      WHERE lh.user_id = p_user_id
      GROUP BY s2.artist_id
    )
  )
  ORDER BY s.play_count DESC
  LIMIT p_limit;
END //


-- Update or create a subscription and sync the user's subscription_type
CREATE PROCEDURE update_user_subscription(
  IN p_user_id INT,
  IN p_plan    VARCHAR(50),
  IN p_months  INT
)
BEGIN
  DECLARE v_price DECIMAL(10,2);

  SET v_price = CASE p_plan
    WHEN 'premium' THEN 9.99
    WHEN 'family'  THEN 14.99
    ELSE 0.00
  END;

  INSERT INTO subscriptions (user_id, plan, start_date, end_date, price)
  VALUES (
    p_user_id,
    p_plan,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL p_months MONTH),
    v_price * p_months
  );

  UPDATE users SET subscription_type = p_plan WHERE user_id = p_user_id;
END //

DELIMITER ;

-- ============================================================
-- SEED DATA  (demo content for the presentation)
-- ============================================================

INSERT INTO artists (name, genre, country, verified, followers_count) VALUES
  ('The Midnight',   'Synthwave',  'USA',     TRUE,  980000),
  ('Daft Punk',      'Electronic', 'France',  TRUE,  5400000),
  ('Arctic Monkeys', 'Rock',       'UK',      TRUE,  8200000),
  ('Kendrick Lamar', 'Hip-Hop',    'USA',     TRUE,  12000000),
  ('Norah Jones',    'Jazz',       'USA',     TRUE,  3100000),
  ('Tame Impala',    'Indie Rock', 'Australia', TRUE, 6700000);

INSERT INTO albums (title, artist_id, release_date, total_tracks) VALUES
  ('Endless Summer',      1, '2022-06-15', 4),
  ('Monsters',            1, '2023-10-01', 4),
  ('Random Access Memories', 2, '2013-05-17', 4),
  ('Discovery',           2, '2001-02-26', 4),
  ('AM',                  3, '2013-09-09', 4),
  ('Tranquility Base Hotel', 3, '2018-05-11', 4),
  ('To Pimp a Butterfly', 4, '2015-03-15', 4),
  ('DAMN.',               4, '2017-04-14', 4),
  ('Come Away with Me',   5, '2002-02-26', 4),
  ('Currents',            6, '2015-07-17', 4);

INSERT INTO songs (title, duration, genre, play_count, likes_count, artist_id, album_id, release_date) VALUES
  -- The Midnight
  ('Sunset',            245, 'Synthwave',  1850000, 42000, 1, 1, '2022-06-15'),
  ('Pacific Coast Highway', 312, 'Synthwave', 1200000, 38000, 1, 1, '2022-06-15'),
  ('Lost Boy',          278, 'Synthwave',   980000, 29000, 1, 1, '2022-07-01'),
  ('Avalanche',         295, 'Synthwave',   760000, 21000, 1, 1, '2022-08-01'),
  ('Monster (feat. Caroline Ailin)', 268, 'Synthwave', 2100000, 51000, 1, 2, '2023-10-01'),
  ('Deep Blue',         330, 'Synthwave',  1450000, 44000, 1, 2, '2023-10-01'),
  ('Crystalline',       291, 'Synthwave',  1100000, 33000, 1, 2, '2023-11-01'),
  ('Horizons',          307, 'Synthwave',   890000, 27000, 1, 2, '2023-11-15'),

  -- Daft Punk
  ('Get Lucky',         369, 'Electronic', 9800000, 280000, 2, 3, '2013-04-19'),
  ('Instant Crush',     337, 'Electronic', 6200000, 195000, 2, 3, '2013-05-17'),
  ('Lose Yourself to Dance', 345, 'Electronic', 4700000, 150000, 2, 3, '2013-06-20'),
  ('Give Life Back to Music', 274, 'Electronic', 3900000, 120000, 2, 3, '2013-05-17'),
  ('One More Time',     320, 'Electronic', 15000000, 420000, 2, 4, '2001-11-13'),
  ('Harder Better Faster', 229, 'Electronic', 12500000, 380000, 2, 4, '2001-03-12'),
  ('Digital Love',      301, 'Electronic', 8900000, 260000, 2, 4, '2001-07-02'),
  ('Aerodynamic',       212, 'Electronic', 7400000, 210000, 2, 4, '2001-02-26'),

  -- Arctic Monkeys
  ('R U Mine?',         202, 'Rock',       11200000, 320000, 3, 5, '2012-04-27'),
  ('Do I Wanna Know?',  272, 'Rock',       18500000, 540000, 3, 5, '2013-06-19'),
  ('Why''d You Only Call Me When You''re High?', 163, 'Rock', 9600000, 275000, 3, 5, '2013-08-26'),
  ('505',               254, 'Rock',       22000000, 620000, 3, 5, '2007-08-06'),
  ('Star Treatment',    441, 'Indie Rock', 5800000, 165000, 3, 6, '2018-05-11'),
  ('Four Out of Five',  329, 'Indie Rock', 4200000, 122000, 3, 6, '2018-05-11'),
  ('One Point Perspective', 327, 'Indie Rock', 3700000, 108000, 3, 6, '2018-05-11'),
  ('American Sports',   187, 'Indie Rock', 2900000,  84000, 3, 6, '2018-05-11'),

  -- Kendrick Lamar
  ('Alright',           219, 'Hip-Hop',   14000000, 410000, 4, 7, '2015-06-30'),
  ('King Kunta',        234, 'Hip-Hop',   10500000, 310000, 4, 7, '2015-03-15'),
  ('The Blacker the Berry', 325, 'Hip-Hop', 8700000, 255000, 4, 7, '2015-02-09'),
  ('i',                 276, 'Hip-Hop',    7200000, 215000, 4, 7, '2014-09-22'),
  ('HUMBLE.',           177, 'Hip-Hop',   29000000, 820000, 4, 8, '2017-03-30'),
  ('DNA.',              185, 'Hip-Hop',   20000000, 590000, 4, 8, '2017-04-14'),
  ('LOYALTY.',          233, 'Hip-Hop',   14500000, 430000, 4, 8, '2017-04-14'),
  ('ELEMENT.',          196, 'Hip-Hop',   13000000, 380000, 4, 8, '2017-04-14'),

  -- Norah Jones
  ('Come Away with Me', 200, 'Jazz',       6500000, 185000, 5, 9, '2001-10-25'),
  ('Don''t Know Why',   184, 'Jazz',       9200000, 260000, 5, 9, '2002-02-26'),
  ('Turn Me On',        155, 'Jazz',       5100000, 146000, 5, 9, '2002-02-26'),
  ('Shoot the Moon',    212, 'Jazz',       4300000, 122000, 5, 9, '2002-02-26'),

  -- Tame Impala
  ('Let It Happen',     467, 'Indie Rock', 13500000, 390000, 6, 10, '2015-05-15'),
  ('The Less I Know the Better', 216, 'Indie Rock', 24000000, 680000, 6, 10, '2015-07-17'),
  ('Eventually',        317, 'Indie Rock',  9800000, 285000, 6, 10, '2015-07-17'),
  ('Cause I''m a Man',  280, 'Indie Rock',  7600000, 220000, 6, 10, '2015-07-17');

-- ============================================================
-- DONE
-- ============================================================
SELECT 'Database setup complete!' AS status;
SELECT CONCAT(COUNT(*), ' artists')  AS summary FROM artists
UNION ALL SELECT CONCAT(COUNT(*), ' albums')   FROM albums
UNION ALL SELECT CONCAT(COUNT(*), ' songs')    FROM songs;
