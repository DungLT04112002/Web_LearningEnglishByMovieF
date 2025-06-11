const Movie = require('../../models/Movie');

// Thêm mới một bộ phim
const createMovie = async (req, res) => {
    try {
        const result = await Movie.create(req.body);
        res.status(201).json({
            message: 'Movie created successfully',
            movieId: result.insertId
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
        const movies = await Movie.findAll();
        res.status(200).json(movies);
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
        const movie = await Movie.findById(id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json(movie);
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
    try {
        const result = await Movie.update(id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie updated successfully' });
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
        const result = await Movie.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie deleted successfully' });
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