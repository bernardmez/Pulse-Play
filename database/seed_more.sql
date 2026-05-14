USE pulse_play;

-- More artists
INSERT INTO artists (name, genre, country, verified, followers_count) VALUES
  ('Drake',           'Hip-Hop',    'Canada', TRUE, 98000000),
  ('Eminem',          'Hip-Hop',    'USA',    TRUE, 88000000),
  ('Coldplay',        'Rock',       'UK',     TRUE, 72000000),
  ('Queen',           'Rock',       'UK',     TRUE, 65000000),
  ('Linkin Park',     'Rock',       'USA',    TRUE, 58000000),
  ('Ariana Grande',   'Pop',        'USA',    TRUE, 81000000),
  ('Bruno Mars',      'Pop',        'USA',    TRUE, 70000000),
  ('Calvin Harris',   'Electronic', 'UK',     TRUE, 55000000),
  ('Avicii',          'Electronic', 'Sweden', TRUE, 49000000),
  ('Miles Davis',     'Jazz',       'USA',    TRUE, 12000000),
  ('Bon Iver',        'Indie Rock', 'USA',    TRUE, 18000000),
  ('Radiohead',       'Indie Rock', 'UK',     TRUE, 42000000);

-- Albums
INSERT INTO albums (title, artist_id, release_date, total_tracks) VALUES
  ('Certified Lover Boy', (SELECT artist_id FROM artists WHERE name='Drake'),        '2021-09-03', 4),
  ('Scorpion',            (SELECT artist_id FROM artists WHERE name='Drake'),        '2018-06-29', 4),
  ('The Marshall Mathers LP', (SELECT artist_id FROM artists WHERE name='Eminem'),   '2000-05-23', 4),
  ('Recovery',            (SELECT artist_id FROM artists WHERE name='Eminem'),       '2010-06-18', 4),
  ('A Head Full of Dreams',(SELECT artist_id FROM artists WHERE name='Coldplay'),    '2015-12-04', 4),
  ('Parachutes',          (SELECT artist_id FROM artists WHERE name='Coldplay'),     '2000-07-10', 4),
  ('A Night at the Opera',(SELECT artist_id FROM artists WHERE name='Queen'),        '1975-11-21', 4),
  ('Innuendo',            (SELECT artist_id FROM artists WHERE name='Queen'),        '1991-02-05', 4),
  ('Hybrid Theory',       (SELECT artist_id FROM artists WHERE name='Linkin Park'),  '2000-10-24', 4),
  ('Meteora',             (SELECT artist_id FROM artists WHERE name='Linkin Park'),  '2003-03-25', 4),
  ('Thank U Next',        (SELECT artist_id FROM artists WHERE name='Ariana Grande'),'2019-02-08', 4),
  ('Positions',           (SELECT artist_id FROM artists WHERE name='Ariana Grande'),'2020-10-30', 4),
  ('24K Magic',           (SELECT artist_id FROM artists WHERE name='Bruno Mars'),   '2016-11-18', 4),
  ('Unorthodox Jukebox',  (SELECT artist_id FROM artists WHERE name='Bruno Mars'),   '2012-12-11', 4),
  ('Funk Wav Bounces Vol 1',(SELECT artist_id FROM artists WHERE name='Calvin Harris'),'2017-06-30',4),
  ('Motion',              (SELECT artist_id FROM artists WHERE name='Calvin Harris'), '2014-10-31', 4),
  ('Stories',             (SELECT artist_id FROM artists WHERE name='Avicii'),        '2015-10-02', 4),
  ('True',                (SELECT artist_id FROM artists WHERE name='Avicii'),        '2013-09-13', 4),
  ('Kind of Blue',        (SELECT artist_id FROM artists WHERE name='Miles Davis'),   '1959-08-17', 4),
  ('For Emma Forever Ago',(SELECT artist_id FROM artists WHERE name='Bon Iver'),      '2007-07-09', 4),
  ('OK Computer',         (SELECT artist_id FROM artists WHERE name='Radiohead'),     '1997-05-21', 4),
  ('In Rainbows',         (SELECT artist_id FROM artists WHERE name='Radiohead'),     '2007-10-10', 4);

-- Songs
INSERT INTO songs (title, duration, genre, play_count, likes_count, artist_id, album_id, release_date) VALUES

  -- Drake
  ('Knife Talk',          175, 'Hip-Hop', 38000000,  950000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Certified Lover Boy'), '2021-09-03'),
  ('Way 2 Sexy',          268, 'Hip-Hop', 32000000,  820000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Certified Lover Boy'), '2021-09-03'),
  ('Champagne Poetry',    322, 'Hip-Hop', 28000000,  740000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Certified Lover Boy'), '2021-09-03'),
  ('TSU',                 198, 'Hip-Hop', 22000000,  580000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Certified Lover Boy'), '2021-09-03'),
  ('God''s Plan',         198, 'Hip-Hop', 85000000, 2400000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Scorpion'), '2018-01-19'),
  ('In My Feelings',      217, 'Hip-Hop', 72000000, 2100000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Scorpion'), '2018-07-10'),
  ('Nice for What',       210, 'Hip-Hop', 58000000, 1700000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Scorpion'), '2018-04-06'),
  ('Nonstop',             193, 'Hip-Hop', 48000000, 1400000, (SELECT artist_id FROM artists WHERE name='Drake'), (SELECT album_id FROM albums WHERE title='Scorpion'), '2018-06-29'),

  -- Eminem
  ('The Real Slim Shady', 284, 'Hip-Hop', 68000000, 1900000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='The Marshall Mathers LP'), '2000-05-23'),
  ('Stan',                404, 'Hip-Hop', 55000000, 1600000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='The Marshall Mathers LP'), '2000-11-20'),
  ('The Way I Am',        291, 'Hip-Hop', 44000000, 1300000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='The Marshall Mathers LP'), '2000-09-05'),
  ('Kim',                 381, 'Hip-Hop', 32000000,  920000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='The Marshall Mathers LP'), '2000-05-23'),
  ('Not Afraid',          263, 'Hip-Hop', 62000000, 1800000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='Recovery'), '2010-04-29'),
  ('Love the Way You Lie',263, 'Hip-Hop', 78000000, 2200000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='Recovery'), '2010-07-01'),
  ('No Love',             344, 'Hip-Hop', 42000000, 1200000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='Recovery'), '2010-11-09'),
  ('Space Bound',         300, 'Hip-Hop', 35000000, 1000000, (SELECT artist_id FROM artists WHERE name='Eminem'), (SELECT album_id FROM albums WHERE title='Recovery'), '2011-06-14'),

  -- Coldplay
  ('A Sky Full of Stars',  269, 'Rock', 58000000, 1700000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='A Head Full of Dreams'), '2014-05-02'),
  ('Adventure of a Lifetime',234,'Rock',48000000, 1400000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='A Head Full of Dreams'), '2015-10-02'),
  ('Hymn for the Weekend', 257, 'Rock', 62000000, 1800000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='A Head Full of Dreams'), '2016-01-29'),
  ('Up&Up',                476, 'Rock', 38000000, 1100000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='A Head Full of Dreams'), '2016-06-03'),
  ('Yellow',               269, 'Rock', 72000000, 2100000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='Parachutes'), '2000-06-26'),
  ('The Scientist',        307, 'Rock', 68000000, 1900000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='Parachutes'), '2002-10-07'),
  ('Clocks',               308, 'Rock', 58000000, 1700000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='Parachutes'), '2002-01-29'),
  ('Trouble',              270, 'Rock', 42000000, 1200000, (SELECT artist_id FROM artists WHERE name='Coldplay'), (SELECT album_id FROM albums WHERE title='Parachutes'), '2000-10-02'),

  -- Queen
  ('Bohemian Rhapsody',    354, 'Rock', 182000000,5200000, (SELECT artist_id FROM artists WHERE name='Queen'), (SELECT album_id FROM albums WHERE title='A Night at the Opera'), '1975-10-31'),
  ('Love of My Life',      210, 'Rock',  88000000,2500000, (SELECT artist_id FROM artists WHERE name='Queen'), (SELECT album_id FROM albums WHERE title='A Night at the Opera'), '1975-11-21'),
  ('You''re My Best Friend',170,'Rock',  65000000,1900000, (SELECT artist_id FROM artists WHERE name='Queen'), (SELECT album_id FROM albums WHERE title='A Night at the Opera'), '1975-11-21'),
  ('''39',                  216, 'Rock', 48000000,1400000, (SELECT artist_id FROM artists WHERE name='Queen'), (SELECT album_id FROM albums WHERE title='A Night at the Opera'), '1975-11-21'),
  ('The Show Must Go On',  263, 'Rock', 95000000,2800000, (SELECT artist_id FROM artists WHERE name='Queen'), (SELECT album_id FROM albums WHERE title='Innuendo'), '1991-10-14'),
  ('Innuendo',             396, 'Rock', 72000000,2100000, (SELECT artist_id FROM artists WHERE name='Queen'), (SELECT album_id FROM albums WHERE title='Innuendo'), '1991-01-14'),
  ('These Are the Days of Our Lives',244,'Rock',55000000,1600000,(SELECT artist_id FROM artists WHERE name='Queen'),(SELECT album_id FROM albums WHERE title='Innuendo'),'1991-10-21'),
  ('I''m Going Slightly Mad',228,'Rock',42000000,1200000,(SELECT artist_id FROM artists WHERE name='Queen'),(SELECT album_id FROM albums WHERE title='Innuendo'),'1991-02-04'),

  -- Linkin Park
  ('In the End',           216, 'Rock', 120000000,3400000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Hybrid Theory'),'2000-10-24'),
  ('Crawling',             209, 'Rock',  78000000,2200000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Hybrid Theory'),'2001-03-28'),
  ('Papercut',             183, 'Rock',  62000000,1800000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Hybrid Theory'),'2000-10-24'),
  ('One Step Closer',      156, 'Rock',  55000000,1600000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Hybrid Theory'),'2000-09-15'),
  ('Numb',                 187, 'Rock', 110000000,3200000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Meteora'),'2003-09-16'),
  ('Somewhere I Belong',   194, 'Rock',  82000000,2300000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Meteora'),'2003-03-25'),
  ('Breaking the Habit',   196, 'Rock',  70000000,2000000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Meteora'),'2004-08-09'),
  ('Faint',                162, 'Rock',  60000000,1750000,(SELECT artist_id FROM artists WHERE name='Linkin Park'),(SELECT album_id FROM albums WHERE title='Meteora'),'2004-01-27'),

  -- Ariana Grande
  ('thank u next',         207, 'Pop', 88000000,2500000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Thank U Next'),'2018-11-03'),
  ('7 rings',              178, 'Pop', 78000000,2200000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Thank U Next'),'2019-01-18'),
  ('break up with your girlfriend', 190,'Pop',58000000,1700000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Thank U Next'),'2019-02-08'),
  ('imagine',              207, 'Pop', 48000000,1400000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Thank U Next'),'2018-12-14'),
  ('positions',            172, 'Pop', 62000000,1800000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Positions'),'2020-10-23'),
  ('34+35',                173, 'Pop', 52000000,1500000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Positions'),'2020-10-30'),
  ('pov',                  204, 'Pop', 44000000,1300000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Positions'),'2020-10-30'),
  ('off the table',        250, 'Pop', 36000000,1050000,(SELECT artist_id FROM artists WHERE name='Ariana Grande'),(SELECT album_id FROM albums WHERE title='Positions'),'2020-10-30'),

  -- Bruno Mars
  ('That''s What I Like',  206, 'Pop', 82000000,2300000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='24K Magic'),'2017-01-30'),
  ('24K Magic',            226, 'Pop', 72000000,2050000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='24K Magic'),'2016-10-07'),
  ('Versace on the Floor', 274, 'Pop', 55000000,1600000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='24K Magic'),'2017-03-24'),
  ('Chunky',               178, 'Pop', 42000000,1200000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='24K Magic'),'2016-11-18'),
  ('Locked Out of Heaven', 234, 'Pop', 78000000,2200000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='Unorthodox Jukebox'),'2012-10-01'),
  ('When I Was Your Man',  211, 'Pop', 68000000,1950000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='Unorthodox Jukebox'),'2013-02-11'),
  ('Treasure',             177, 'Pop', 58000000,1700000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='Unorthodox Jukebox'),'2012-08-28'),
  ('Gorilla',              242, 'Pop', 42000000,1200000,(SELECT artist_id FROM artists WHERE name='Bruno Mars'),(SELECT album_id FROM albums WHERE title='Unorthodox Jukebox'),'2012-11-19'),

  -- Calvin Harris
  ('Feels',                214, 'Electronic', 65000000,1850000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Funk Wav Bounces Vol 1'),'2017-06-16'),
  ('Slide',                250, 'Electronic', 55000000,1600000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Funk Wav Bounces Vol 1'),'2017-03-10'),
  ('Prayers Up',           228, 'Electronic', 42000000,1200000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Funk Wav Bounces Vol 1'),'2017-06-30'),
  ('Cash Out',             226, 'Electronic', 35000000,1000000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Funk Wav Bounces Vol 1'),'2017-06-30'),
  ('Summer',               222, 'Electronic', 72000000,2100000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Motion'),'2014-03-17'),
  ('Outside',              206, 'Electronic', 52000000,1500000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Motion'),'2014-10-10'),
  ('How Deep Is Your Love',215, 'Electronic', 62000000,1800000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Motion'),'2015-05-01'),
  ('Blame',                210, 'Electronic', 48000000,1400000,(SELECT artist_id FROM artists WHERE name='Calvin Harris'),(SELECT album_id FROM albums WHERE title='Motion'),'2014-10-23'),

  -- Avicii
  ('Wake Me Up',           247, 'Electronic', 92000000,2600000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='True'),'2013-06-17'),
  ('Hey Brother',          261, 'Electronic', 75000000,2150000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='True'),'2013-09-13'),
  ('You Make Me',          214, 'Electronic', 58000000,1700000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='True'),'2013-04-08'),
  ('Addicted to You',      229, 'Electronic', 48000000,1400000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='True'),'2013-09-13'),
  ('The Nights',           173, 'Electronic', 82000000,2300000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='Stories'),'2014-10-29'),
  ('Waiting for Love',     204, 'Electronic', 68000000,1950000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='Stories'),'2015-05-20'),
  ('For a Better Day',     244, 'Electronic', 52000000,1500000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='Stories'),'2015-10-02'),
  ('Pure Grinding',        224, 'Electronic', 42000000,1200000,(SELECT artist_id FROM artists WHERE name='Avicii'),(SELECT album_id FROM albums WHERE title='Stories'),'2015-10-02'),

  -- Miles Davis (Jazz)
  ('So What',              562, 'Jazz', 28000000, 820000,(SELECT artist_id FROM artists WHERE name='Miles Davis'),(SELECT album_id FROM albums WHERE title='Kind of Blue'),'1959-08-17'),
  ('Freddie Freeloader',   585, 'Jazz', 22000000, 640000,(SELECT artist_id FROM artists WHERE name='Miles Davis'),(SELECT album_id FROM albums WHERE title='Kind of Blue'),'1959-08-17'),
  ('Blue in Green',        337, 'Jazz', 18000000, 520000,(SELECT artist_id FROM artists WHERE name='Miles Davis'),(SELECT album_id FROM albums WHERE title='Kind of Blue'),'1959-08-17'),
  ('All Blues',            692, 'Jazz', 15000000, 440000,(SELECT artist_id FROM artists WHERE name='Miles Davis'),(SELECT album_id FROM albums WHERE title='Kind of Blue'),'1959-08-17'),

  -- Bon Iver (Indie Rock)
  ('Skinny Love',          213, 'Indie Rock', 38000000,1100000,(SELECT artist_id FROM artists WHERE name='Bon Iver'),(SELECT album_id FROM albums WHERE title='For Emma Forever Ago'),'2007-07-09'),
  ('Flume',                239, 'Indie Rock', 28000000, 820000,(SELECT artist_id FROM artists WHERE name='Bon Iver'),(SELECT album_id FROM albums WHERE title='For Emma Forever Ago'),'2007-07-09'),
  ('Re: Stacks',           349, 'Indie Rock', 24000000, 700000,(SELECT artist_id FROM artists WHERE name='Bon Iver'),(SELECT album_id FROM albums WHERE title='For Emma Forever Ago'),'2007-07-09'),
  ('The Wolves (Act I and II)',326,'Indie Rock',20000000,580000,(SELECT artist_id FROM artists WHERE name='Bon Iver'),(SELECT album_id FROM albums WHERE title='For Emma Forever Ago'),'2007-07-09'),

  -- Radiohead (Indie Rock)
  ('Karma Police',         259, 'Indie Rock', 65000000,1850000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='OK Computer'),'1997-08-25'),
  ('Paranoid Android',     384, 'Indie Rock', 58000000,1700000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='OK Computer'),'1997-05-26'),
  ('No Surprises',         228, 'Indie Rock', 52000000,1500000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='OK Computer'),'1997-12-22'),
  ('Fake Plastic Trees',   286, 'Indie Rock', 44000000,1300000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='OK Computer'),'1995-05-22'),
  ('Nude',                 255, 'Indie Rock', 48000000,1400000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='In Rainbows'),'2007-10-10'),
  ('Weird Fishes/Arpeggi', 318, 'Indie Rock', 42000000,1200000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='In Rainbows'),'2007-10-10'),
  ('Reckoner',             290, 'Indie Rock', 38000000,1100000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='In Rainbows'),'2007-10-10'),
  ('House of Cards',       317, 'Indie Rock', 32000000, 920000,(SELECT artist_id FROM artists WHERE name='Radiohead'),(SELECT album_id FROM albums WHERE title='In Rainbows'),'2007-10-10');

SELECT CONCAT(COUNT(*), ' total songs in database') AS status FROM songs;
SELECT CONCAT(COUNT(*), ' total artists') AS status FROM artists;
