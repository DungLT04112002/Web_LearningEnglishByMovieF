const connection = require('../../config/database');

// Thêm mới một bộ phim
const createMovie = async (req, res) => {
    const { title, description, thumbnail_url, video_url, release_year, genre, difficulty } = req.body;
    const movieGenre = genre || null;

    try {
        const sql = `
            INSERT INTO movies (title, description, thumbnail_url, video_url, release_year, genre, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const data = [title, description, thumbnail_url, video_url, release_year, movieGenre, difficulty];

        connection.query(sql, data, (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Error creating movie',
                    details: err.message
                });
            }
            res.status(201).json({
                message: 'Movie created successfully',
                movieId: result.insertId
            });
        });
    } catch (err) {
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

        connection.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Error fetching movies',
                    details: err.message
                });
            }
            res.status(200).json(result);
        });
    } catch (err) {
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

        connection.query(sql, [id], (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Error fetching movie',
                    details: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json(result[0]);
        });
    } catch (err) {
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
};

// Cập nhật thông tin phim
const updateMovie = async (req, res) => {
    const { id } = req.params;
    const { title, description, thumbnail_url, video_url, release_year, genre, difficulty } = req.body;
    const movieGenre = genre || null;

    try {
        const sql = `
            UPDATE movies 
            SET title = ?, description = ?, thumbnail_url = ?, 
                video_url = ?, release_year = ?, genre = ?, difficulty = ?
            WHERE id = ?
        `;

        const data = [title, description, thumbnail_url, video_url, release_year, movieGenre, difficulty, id];

        connection.query(sql, data, (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Error updating movie',
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json({ message: 'Movie updated successfully' });
        });
    } catch (err) {
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
                return res.status(500).json({
                    error: 'Error deleting movie',
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json({ message: 'Movie deleted successfully' });
        });
    } catch (err) {
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