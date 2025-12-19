// ============================================================================
// PULSE PLAY - Backend Server
// ============================================================================
// Node.js + Express + MySQL Backend API
// ============================================================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulse_play',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// MIDDLEWARE - Authentication
// ============================================================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, country } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, country) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, country || 'Unknown']
        );

        // Generate token
        const token = jwt.sign(
            { userId: result.insertId, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId,
            token
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const [users] = await pool.query(
            'SELECT user_id, name, email, password, subscription_type FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                subscriptionType: user.subscription_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ============================================================================
// REQUIRED COMPLEX QUERIES (As per project requirements)
// ============================================================================

// Query 1: Multi-table JOIN - Get user's complete listening history with song and artist details
app.get('/api/queries/listening-history/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                lh.history_id,
                lh.played_at,
                lh.play_duration,
                lh.completed,
                lh.device_type,
                s.song_id,
                s.title AS song_title,
                s.duration AS song_duration,
                s.genre,
                a.artist_id,
                a.name AS artist_name,
                al.album_id,
                al.title AS album_title,
                al.cover_image
            FROM listening_history lh
            INNER JOIN songs s ON lh.song_id = s.song_id
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
            WHERE lh.user_id = ?
            ORDER BY lh.played_at DESC
            LIMIT 50
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch listening history' });
    }
});

// Query 2: Multi-table JOIN - Get playlist details with all songs
app.get('/api/queries/playlist-details/:playlistId', async (req, res) => {
    try {
        const { playlistId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                p.playlist_id,
                p.title AS playlist_title,
                p.description,
                p.total_tracks,
                p.total_duration,
                u.name AS owner_name,
                ps.position,
                s.song_id,
                s.title AS song_title,
                s.duration,
                s.genre,
                a.name AS artist_name,
                al.title AS album_title,
                al.cover_image
            FROM playlists p
            INNER JOIN users u ON p.user_id = u.user_id
            INNER JOIN playlist_songs ps ON p.playlist_id = ps.playlist_id
            INNER JOIN songs s ON ps.song_id = s.song_id
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
            WHERE p.playlist_id = ?
            ORDER BY ps.position ASC
        `, [playlistId]);

        res.json(rows);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch playlist details' });
    }
});

// Query 3: Nested Query - Find users who have listened to more songs than average
app.get('/api/queries/active-listeners', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.subscription_type,
                COUNT(DISTINCT lh.song_id) AS unique_songs_listened,
                COUNT(lh.history_id) AS total_plays
            FROM users u
            INNER JOIN listening_history lh ON u.user_id = lh.user_id
            GROUP BY u.user_id, u.name, u.email, u.subscription_type
            HAVING COUNT(DISTINCT lh.song_id) > (
                SELECT AVG(song_count)
                FROM (
                    SELECT COUNT(DISTINCT song_id) AS song_count
                    FROM listening_history
                    GROUP BY user_id
                ) AS avg_songs
            )
            ORDER BY unique_songs_listened DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch active listeners' });
    }
});

// Query 4: Aggregate with GROUP BY - Genre popularity statistics
app.get('/api/queries/genre-statistics', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.genre,
                COUNT(DISTINCT s.song_id) AS total_songs,
                COUNT(DISTINCT s.artist_id) AS total_artists,
                SUM(s.play_count) AS total_plays,
                AVG(s.duration) AS avg_duration,
                MAX(s.play_count) AS most_played_count,
                SUM(s.likes_count) AS total_likes
            FROM songs s
            WHERE s.genre IS NOT NULL
            GROUP BY s.genre
            HAVING COUNT(DISTINCT s.song_id) > 0
            ORDER BY total_plays DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch genre statistics' });
    }
});

// Query 5: Set Operation (UNION) - Get all content from followed artists
app.get('/api/queries/followed-artists-content/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 'album' AS content_type, al.album_id AS content_id, al.title, al.release_date, a.name AS artist_name
            FROM user_following_artists ufa
            INNER JOIN artists a ON ufa.artist_id = a.artist_id
            INNER JOIN albums al ON a.artist_id = al.artist_id
            WHERE ufa.user_id = ?
            
            UNION
            
            SELECT 'song' AS content_type, s.song_id AS content_id, s.title, s.release_date, a.name AS artist_name
            FROM user_following_artists ufa
            INNER JOIN artists a ON ufa.artist_id = a.artist_id
            INNER JOIN songs s ON a.artist_id = s.artist_id
            WHERE ufa.user_id = ?
            
            ORDER BY release_date DESC
            LIMIT 50
        `, [userId, userId]);

        res.json(rows);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch followed artists content' });
    }
});

// ============================================================================
// SONGS ROUTES
// ============================================================================

// Get all songs with pagination
app.get('/api/songs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const genre = req.query.genre;

        let query = `
            SELECT 
                s.song_id,
                s.title,
                s.duration,
                s.genre,
                s.play_count,
                s.likes_count,
                a.artist_id,
                a.name AS artist_name,
                al.album_id,
                al.title AS album_title,
                al.cover_image
            FROM songs s
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
        `;

        const params = [];
        
        if (genre) {
            query += ' WHERE s.genre = ?';
            params.push(genre);
        }

        query += ' ORDER BY s.play_count DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM songs';
        if (genre) {
            countQuery += ' WHERE genre = ?';
        }
        const [countResult] = await pool.query(countQuery, genre ? [genre] : []);

        res.json({
            songs: rows,
            pagination: {
                page,
                limit,
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// Get single song
app.get('/api/songs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                s.*,
                a.name AS artist_name,
                a.genre AS artist_genre,
                al.title AS album_title,
                al.cover_image,
                al.release_date AS album_release_date
            FROM songs s
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
            WHERE s.song_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Song not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching song:', error);
        res.status(500).json({ error: 'Failed to fetch song' });
    }
});

// Search songs
app.get('/api/songs/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const searchTerm = `%${query}%`;

        const [rows] = await pool.query(`
            SELECT 
                s.song_id,
                s.title,
                s.duration,
                s.genre,
                s.play_count,
                a.name AS artist_name,
                al.cover_image
            FROM songs s
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
            WHERE s.title LIKE ? OR a.name LIKE ?
            ORDER BY s.play_count DESC
            LIMIT 50
        `, [searchTerm, searchTerm]);

        res.json(rows);
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({ error: 'Failed to search songs' });
    }
});

// Get trending songs
app.get('/api/songs/trending/all', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.song_id,
                s.title,
                s.duration,
                s.genre,
                s.play_count,
                s.likes_count,
                a.name AS artist_name,
                al.cover_image
            FROM songs s
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
            ORDER BY s.play_count DESC
            LIMIT 20
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching trending songs:', error);
        res.status(500).json({ error: 'Failed to fetch trending songs' });
    }
});

// ============================================================================
// ARTISTS ROUTES
// ============================================================================

// Get all artists
app.get('/api/artists', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM artist_statistics
            ORDER BY total_plays DESC
            LIMIT 50
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ error: 'Failed to fetch artists' });
    }
});

// Get artist details
app.get('/api/artists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [artists] = await pool.query(`
            SELECT * FROM artists WHERE artist_id = ?
        `, [id]);

        if (artists.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // Get artist's songs
        const [songs] = await pool.query(`
            SELECT 
                s.song_id,
                s.title,
                s.duration,
                s.genre,
                s.play_count,
                s.likes_count,
                al.title AS album_title,
                al.cover_image
            FROM songs s
            LEFT JOIN albums al ON s.album_id = al.album_id
            WHERE s.artist_id = ?
            ORDER BY s.play_count DESC
        `, [id]);

        // Get artist's albums
        const [albums] = await pool.query(`
            SELECT * FROM albums
            WHERE artist_id = ?
            ORDER BY release_date DESC
        `, [id]);

        res.json({
            artist: artists[0],
            songs,
            albums
        });
    } catch (error) {
        console.error('Error fetching artist:', error);
        res.status(500).json({ error: 'Failed to fetch artist' });
    }
});

// ============================================================================
// ALBUMS ROUTES
// ============================================================================

// Get all albums
app.get('/api/albums', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                al.*,
                a.name AS artist_name
            FROM albums al
            INNER JOIN artists a ON al.artist_id = a.artist_id
            ORDER BY al.release_date DESC
            LIMIT 50
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching albums:', error);
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

// Get album details with songs
app.get('/api/albums/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [albums] = await pool.query(`
            SELECT 
                al.*,
                a.name AS artist_name,
                a.artist_id
            FROM albums al
            INNER JOIN artists a ON al.artist_id = a.artist_id
            WHERE al.album_id = ?
        `, [id]);

        if (albums.length === 0) {
            return res.status(404).json({ error: 'Album not found' });
        }

        const [songs] = await pool.query(`
            SELECT 
                s.song_id,
                s.title,
                s.duration,
                s.genre,
                s.play_count,
                s.likes_count
            FROM songs s
            WHERE s.album_id = ?
            ORDER BY s.song_id ASC
        `, [id]);

        res.json({
            album: albums[0],
            songs
        });
    } catch (error) {
        console.error('Error fetching album:', error);
        res.status(500).json({ error: 'Failed to fetch album' });
    }
});

// ============================================================================
// PLAYLISTS ROUTES
// ============================================================================

// Get user's playlists
app.get('/api/playlists/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT * FROM user_playlist_details
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// Create playlist
app.post('/api/playlists', authenticateToken, async (req, res) => {
    try {
        const { title, description, isPublic } = req.body;
        const userId = req.user.userId;

        const [result] = await pool.query(`
            INSERT INTO playlists (title, description, user_id, is_public)
            VALUES (?, ?, ?, ?)
        `, [title, description || '', userId, isPublic !== false]);

        res.status(201).json({
            message: 'Playlist created successfully',
            playlistId: result.insertId
        });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// Add song to playlist (using stored procedure)
app.post('/api/playlists/:playlistId/songs', authenticateToken, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { songId } = req.body;

        await pool.query('CALL add_song_to_playlist(?, ?)', [playlistId, songId]);

        res.json({ message: 'Song added to playlist successfully' });
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        res.status(500).json({ error: 'Failed to add song to playlist' });
    }
});

// Remove song from playlist (using stored procedure)
app.delete('/api/playlists/:playlistId/songs/:songId', authenticateToken, async (req, res) => {
    try {
        const { playlistId, songId } = req.params;

        await pool.query('CALL remove_song_from_playlist(?, ?)', [playlistId, songId]);

        res.json({ message: 'Song removed from playlist successfully' });
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        res.status(500).json({ error: 'Failed to remove song from playlist' });
    }
});

// Delete playlist
app.delete('/api/playlists/:playlistId', authenticateToken, async (req, res) => {
    try {
        const { playlistId } = req.params;

        await pool.query('DELETE FROM playlists WHERE playlist_id = ?', [playlistId]);

        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

// ============================================================================
// USER FAVORITES ROUTES
// ============================================================================

// Get user's favorite songs
app.get('/api/favorites/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                s.song_id,
                s.title,
                s.duration,
                s.genre,
                s.play_count,
                a.name AS artist_name,
                al.cover_image,
                uf.added_at
            FROM user_favorites uf
            INNER JOIN songs s ON uf.song_id = s.song_id
            INNER JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN albums al ON s.album_id = al.album_id
            WHERE uf.user_id = ?
            ORDER BY uf.added_at DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Add to favorites
app.post('/api/favorites', authenticateToken, async (req, res) => {
    try {
        const { songId } = req.body;
        const userId = req.user.userId;

        await pool.query(`
            INSERT INTO user_favorites (user_id, song_id)
            VALUES (?, ?)
        `, [userId, songId]);

        res.json({ message: 'Song added to favorites' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Song already in favorites' });
        }
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Remove from favorites
app.delete('/api/favorites/:songId', authenticateToken, async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.user.userId;

        await pool.query(`
            DELETE FROM user_favorites
            WHERE user_id = ? AND song_id = ?
        `, [userId, songId]);

        res.json({ message: 'Song removed from favorites' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

// ============================================================================
// LISTENING HISTORY ROUTES
// ============================================================================

// Record song play (using stored procedure with transaction)
app.post('/api/listening-history', authenticateToken, async (req, res) => {
    try {
        const { songId, duration, device } = req.body;
        const userId = req.user.userId;

        await pool.query(
            'CALL record_song_play(?, ?, ?, ?)',
            [userId, songId, duration, device || 'web']
        );

        res.json({ message: 'Play recorded successfully' });
    } catch (error) {
        console.error('Error recording play:', error);
        res.status(500).json({ error: 'Failed to record play' });
    }
});

// ============================================================================
// SUBSCRIPTIONS ROUTES
// ============================================================================

// Update subscription (using stored procedure with transaction)
app.post('/api/subscriptions/update', authenticateToken, async (req, res) => {
    try {
        const { plan, months } = req.body;
        const userId = req.user.userId;

        await pool.query(
            'CALL update_user_subscription(?, ?, ?)',
            [userId, plan, months || 1]
        );

        res.json({ message: 'Subscription updated successfully' });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// Get user's active subscription
app.get('/api/subscriptions/active/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT * FROM active_subscriptions
            WHERE user_id = ?
            LIMIT 1
        `, [userId]);

        res.json(rows[0] || null);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// ============================================================================
// RECOMMENDATIONS ROUTES
// ============================================================================

// Get personalized recommendations (using stored procedure)
app.get('/api/recommendations/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const [rows] = await pool.query(
            'CALL get_user_recommendations(?, ?)',
            [userId, limit]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// ============================================================================
// FOLLOWING ARTISTS ROUTES
// ============================================================================

// Follow artist
app.post('/api/follow-artist', authenticateToken, async (req, res) => {
    try {
        const { artistId } = req.body;
        const userId = req.user.userId;

        await pool.query(`
            INSERT INTO user_following_artists (user_id, artist_id)
            VALUES (?, ?)
        `, [userId, artistId]);

        res.json({ message: 'Artist followed successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Already following this artist' });
        }
        console.error('Error following artist:', error);
        res.status(500).json({ error: 'Failed to follow artist' });
    }
});

// Unfollow artist
app.delete('/api/follow-artist/:artistId', authenticateToken, async (req, res) => {
    try {
        const { artistId } = req.params;
        const userId = req.user.userId;

        await pool.query(`
            DELETE FROM user_following_artists
            WHERE user_id = ? AND artist_id = ?
        `, [userId, artistId]);

        res.json({ message: 'Artist unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing artist:', error);
        res.status(500).json({ error: 'Failed to unfollow artist' });
    }
});

// Get followed artists
app.get('/api/following/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                ufa.followed_at
            FROM user_following_artists ufa
            INNER JOIN artists a ON ufa.artist_id = a.artist_id
            WHERE ufa.user_id = ?
            ORDER BY ufa.followed_at DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching followed artists:', error);
        res.status(500).json({ error: 'Failed to fetch followed artists' });
    }
});

// ============================================================================
// DASHBOARD/STATS ROUTES
// ============================================================================

// Get user dashboard stats
app.get('/api/dashboard/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Total listening time
        const [listeningTime] = await pool.query(`
            SELECT SUM(play_duration) as total_seconds
            FROM listening_history
            WHERE user_id = ?
        `, [userId]);

        // Favorite genre
        const [favoriteGenre] = await pool.query(`
            SELECT s.genre, COUNT(*) as count
            FROM listening_history lh
            JOIN songs s ON lh.song_id = s.song_id
            WHERE lh.user_id = ?
            GROUP BY s.genre
            ORDER BY count DESC
            LIMIT 1
        `, [userId]);

        // Total playlists
        const [playlists] = await pool.query(`
            SELECT COUNT(*) as count
            FROM playlists
            WHERE user_id = ?
        `, [userId]);

        // Total favorites
        const [favorites] = await pool.query(`
            SELECT COUNT(*) as count
            FROM user_favorites
            WHERE user_id = ?
        `, [userId]);

        res.json({
            totalListeningTime: listeningTime[0].total_seconds || 0,
            favoriteGenre: favoriteGenre[0]?.genre || 'Unknown',
            totalPlaylists: playlists[0].count,
            totalFavorites: favorites[0].count
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
    console.log(`🎵 Pulse Play Backend running on port ${PORT}`);
});

module.exports = app;
