const connection = require('../../config/database');

// Thêm mới một bộ phim
const createMovie = async (req, res) => {
    const { title, description, thumbnail_url, video_url, release_year } = req.body;

    try {
        const query = `
            INSERT INTO movies (title, description, thumbnail_url, video_url, release_year)
            VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(
            query,
            [title, description, thumbnail_url, video_url, release_year],
            (error, results) => {
                if (error) {
                    console.error('Error creating movie:', error);
                    return res.status(500).json({
                        error: 'Error creating movie',
                        details: error.message
                    });
                }
                res.status(201).json({
                    message: 'Movie created successfully',
                    movieId: results.insertId
                });
            }
        );
    } catch (error) {
        console.error('Error in createMovie:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy danh sách phim
const getMovies = async (req, res) => {
    try {
        const query = 'SELECT * FROM movies ORDER BY created_at DESC';

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching movies:', error);
                return res.status(500).json({
                    error: 'Error fetching movies',
                    details: error.message
                });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error in getMovies:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy chi tiết một phim
const getMovieById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM movies WHERE id = ?';

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error fetching movie:', error);
                return res.status(500).json({
                    error: 'Error fetching movie',
                    details: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getMovieById:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật thông tin phim
const updateMovie = async (req, res) => {
    const { id } = req.params;
    const { title, description, thumbnail_url, video_url, release_year } = req.body;

    try {
        const query = `
            UPDATE movies 
            SET title = ?, description = ?, thumbnail_url = ?, 
                video_url = ?, release_year = ?
            WHERE id = ?
        `;

        connection.query(
            query,
            [title, description, thumbnail_url, video_url, release_year, id],
            (error, results) => {
                if (error) {
                    console.error('Error updating movie:', error);
                    return res.status(500).json({
                        error: 'Error updating movie',
                        details: error.message
                    });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Movie not found' });
                }

                res.status(200).json({ message: 'Movie updated successfully' });
            }
        );
    } catch (error) {
        console.error('Error in updateMovie:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Xóa phim
const deleteMovie = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM movies WHERE id = ?';

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error deleting movie:', error);
                return res.status(500).json({
                    error: 'Error deleting movie',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.status(200).json({ message: 'Movie deleted successfully' });
        });
    } catch (error) {
        console.error('Error in deleteMovie:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
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