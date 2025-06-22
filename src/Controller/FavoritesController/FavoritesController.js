const connection = require('../../config/database');

// Add movie to favorites
const addToFavorites = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { movie_id } = req.body;

        if (!movie_id) {
            return res.status(400).json({ error: 'Missing movie_id' });
        }

        const checkSql = 'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?';
        connection.query(checkSql, [user_id, movie_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            if (results.length > 0) {
                return res.status(409).json({ error: 'Movie already in favorites' });
            }

            const insertSql = 'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)';
            connection.query(insertSql, [user_id, movie_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error', details: err.message });
                }
                res.status(201).json({ message: 'Movie added to favorites', favoriteId: result.insertId });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// Remove movie from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { movie_id } = req.body;

        if (!movie_id) {
            return res.status(400).json({ error: 'Missing movie_id' });
        }

        const sql = 'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?';
        connection.query(sql, [user_id, movie_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Favorite not found' });
            }
            res.status(200).json({ message: 'Movie removed from favorites' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// Get user's favorite movies
const getUserFavorites = async (req, res) => {
    try {
        const user_id = req.user.id;

        const sql = `
            SELECT m.*, f.created_at as favorited_at 
            FROM favorites f 
            JOIN movies m ON f.movie_id = m.id 
            WHERE f.user_id = ? 
            ORDER BY f.created_at DESC
        `;

        connection.query(sql, [user_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// Check if movie is favorited by user
const checkIfFavorited = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { movie_id } = req.params;

        if (!movie_id) {
            return res.status(400).json({ error: 'Missing movie_id parameter' });
        }

        const sql = 'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?';
        connection.query(sql, [user_id, movie_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            res.status(200).json({
                isFavorited: results.length > 0
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    checkIfFavorited
};
