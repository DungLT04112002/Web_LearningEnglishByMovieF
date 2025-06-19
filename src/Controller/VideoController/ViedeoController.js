const connection = require('../../config/database');

// Thêm mới một bộ phim
const createMovie = async (req, res) => {
    try {
        const { title, description, thumbnail_url, video_url, release_year, genre, difficulty } = req.body;

        // Validate required fields
        if (!title || !description || !thumbnail_url || !video_url || !release_year || !genre || !difficulty) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'description', 'thumbnail_url', 'video_url', 'release_year', 'genre', 'difficulty']
            });
        }

        const sql = `
            INSERT INTO movies (title, description, thumbnail_url, video_url, release_year, genre, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const data = [title, description, thumbnail_url, video_url, release_year, genre, difficulty];

        connection.query(sql, data, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.message
                });
            }
            res.status(201).json({
                message: 'Movie created successfully',
                movieId: result.insertId
            });
        });
    } catch (err) {
        console.error('Error creating movie:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
};

// Lấy danh sách phim
const getMovies = async (req, res) => {
    try {
        const sql = 'SELECT * FROM movies ORDER BY created_at DESC';

        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.message
                });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        console.error('Error fetching movies:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
};

// Lấy chi tiết một phim
const getMovieById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM movies WHERE id = ?';

        connection.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json(results[0]);
        });
    } catch (err) {
        console.error('Error fetching movie:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
};

// Cập nhật thông tin phim
const updateMovie = async (req, res) => {
    const { id } = req.params;
    try {
        const { title, description, thumbnail_url, video_url, release_year, genre, difficulty } = req.body;

        // Validate required fields
        if (!title || !description || !thumbnail_url || !video_url || !release_year || !genre || !difficulty) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'description', 'thumbnail_url', 'video_url', 'release_year', 'genre', 'difficulty']
            });
        }

        const sql = `
            UPDATE movies 
            SET title = ?, description = ?, thumbnail_url = ?, 
                video_url = ?, release_year = ?, genre = ?, difficulty = ?
            WHERE id = ?
        `;
        const data = [title, description, thumbnail_url, video_url, release_year, genre, difficulty, id];

        connection.query(sql, data, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json({ message: 'Movie updated successfully' });
        });
    } catch (err) {
        console.error('Error updating movie:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
};

// Xóa phim
const deleteMovie = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM movies WHERE id = ?';

        connection.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json({ message: 'Movie deleted successfully' });
        });
    } catch (err) {
        console.error('Error deleting movie:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
};

module.exports = {
    createMovie,
    getMovies,
    getMovieById,
    updateMovie,
    deleteMovie
};