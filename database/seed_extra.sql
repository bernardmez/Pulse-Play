USE pulse_play;

-- Extra artists
INSERT INTO artists (name, genre, country, verified, followers_count) VALUES
  ('Taylor Swift',  'Pop', 'USA', TRUE, 95000000),
  ('Ed Sheeran',    'Pop', 'UK',  TRUE, 75000000),
  ('Billie Eilish', 'Pop', 'USA', TRUE, 62000000),
  ('The Weeknd',    'Pop', 'Canada', TRUE, 85000000);

-- Pop albums
INSERT INTO albums (title, artist_id, release_date, total_tracks) VALUES
  ('Midnights',       (SELECT artist_id FROM artists WHERE name='Taylor Swift'),  '2022-10-21', 4),
  ('1989',            (SELECT artist_id FROM artists WHERE name='Taylor Swift'),  '2014-10-27', 4),
  ('Divide',          (SELECT artist_id FROM artists WHERE name='Ed Sheeran'),    '2017-03-03', 4),
  ('Happier Than Ever',(SELECT artist_id FROM artists WHERE name='Billie Eilish'),'2021-07-30', 4),
  ('After Hours',     (SELECT artist_id FROM artists WHERE name='The Weeknd'),    '2020-03-20', 4);

-- Pop songs
INSERT INTO songs (title, duration, genre, play_count, likes_count, artist_id, album_id, release_date) VALUES
  -- Taylor Swift
  ('Anti-Hero',         197, 'Pop', 48000000, 1200000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='Midnights'), '2022-10-21'),
  ('Lavender Haze',     202, 'Pop', 32000000,  890000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='Midnights'), '2022-10-21'),
  ('Maroon',            213, 'Pop', 28000000,  760000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='Midnights'), '2022-10-21'),
  ('Snow on the Beach', 219, 'Pop', 22000000,  640000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='Midnights'), '2022-10-21'),
  ('Shake It Off',      219, 'Pop', 62000000, 1800000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='1989'), '2014-08-18'),
  ('Blank Space',       231, 'Pop', 55000000, 1600000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='1989'), '2014-11-10'),
  ('Style',             231, 'Pop', 44000000, 1300000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='1989'), '2015-02-09'),
  ('Bad Blood',         211, 'Pop', 38000000, 1100000, (SELECT artist_id FROM artists WHERE name='Taylor Swift'), (SELECT album_id FROM albums WHERE title='1989'), '2015-05-17'),

  -- Ed Sheeran
  ('Shape of You',      234, 'Pop', 78000000, 2100000, (SELECT artist_id FROM artists WHERE name='Ed Sheeran'), (SELECT album_id FROM albums WHERE title='Divide'), '2017-01-06'),
  ('Perfect',           263, 'Pop', 65000000, 1900000, (SELECT artist_id FROM artists WHERE name='Ed Sheeran'), (SELECT album_id FROM albums WHERE title='Divide'), '2017-09-26'),
  ('Galway Girl',       170, 'Pop', 42000000, 1200000, (SELECT artist_id FROM artists WHERE name='Ed Sheeran'), (SELECT album_id FROM albums WHERE title='Divide'), '2017-03-03'),
  ('Castle on the Hill',261, 'Pop', 38000000, 1050000, (SELECT artist_id FROM artists WHERE name='Ed Sheeran'), (SELECT album_id FROM albums WHERE title='Divide'), '2017-01-06'),

  -- Billie Eilish
  ('Happier Than Ever', 295, 'Pop', 52000000, 1500000, (SELECT artist_id FROM artists WHERE name='Billie Eilish'), (SELECT album_id FROM albums WHERE title='Happier Than Ever'), '2021-07-30'),
  ('Therefore I Am',    174, 'Pop', 44000000, 1300000, (SELECT artist_id FROM artists WHERE name='Billie Eilish'), (SELECT album_id FROM albums WHERE title='Happier Than Ever'), '2021-07-30'),
  ('NDA',               177, 'Pop', 36000000, 1050000, (SELECT artist_id FROM artists WHERE name='Billie Eilish'), (SELECT album_id FROM albums WHERE title='Happier Than Ever'), '2021-07-30'),
  ('Lost Cause',        209, 'Pop', 31000000,  890000, (SELECT artist_id FROM artists WHERE name='Billie Eilish'), (SELECT album_id FROM albums WHERE title='Happier Than Ever'), '2021-07-30'),

  -- The Weeknd
  ('Blinding Lights',   200, 'Pop', 95000000, 2800000, (SELECT artist_id FROM artists WHERE name='The Weeknd'), (SELECT album_id FROM albums WHERE title='After Hours'), '2019-11-29'),
  ('Save Your Tears',   215, 'Pop', 72000000, 2100000, (SELECT artist_id FROM artists WHERE name='The Weeknd'), (SELECT album_id FROM albums WHERE title='After Hours'), '2020-08-07'),
  ('After Hours',       361, 'Pop', 58000000, 1700000, (SELECT artist_id FROM artists WHERE name='The Weeknd'), (SELECT album_id FROM albums WHERE title='After Hours'), '2020-03-20'),
  ('Heartless',         187, 'Pop', 48000000, 1400000, (SELECT artist_id FROM artists WHERE name='The Weeknd'), (SELECT album_id FROM albums WHERE title='After Hours'), '2019-11-26');

SELECT CONCAT(COUNT(*), ' total songs now in database') AS status FROM songs;
