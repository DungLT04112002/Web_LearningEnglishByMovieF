const connection = require('../../config/database');

// Thêm quiz mới
const addQuiz = async (req, res) => {
    const { movie_id, passage } = req.body;

    try {
        // Kiểm tra xem phim có tồn tại không
        connection.query(
            'SELECT id FROM movies WHERE id = ?',
            [movie_id],
            (error, movieResults) => {
                if (error) {
                    console.error('Error checking movie:', error);
                    return res.status(500).json({
                        error: 'Error checking movie',
                        details: error.message
                    });
                }

                if (movieResults.length === 0) {
                    return res.status(404).json({ message: 'Movie not found' });
                }

                // Thêm quiz mới
                const query = `
                    INSERT INTO quizzes (movie_id, passage)
                    VALUES (?, ?)
                `;

                connection.query(
                    query,
                    [movie_id, passage],
                    (error, results) => {
                        if (error) {
                            console.error('Error adding quiz:', error);
                            return res.status(500).json({
                                error: 'Error adding quiz',
                                details: error.message
                            });
                        }

                        res.status(201).json({
                            message: 'Quiz added successfully',
                            quizId: results.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in addQuiz:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy tất cả quiz
const getAllQuizzes = async (req, res) => {
    const query = `
        SELECT q.*, m.title as movie_title 
        FROM quizzes q
        JOIN movies m ON q.movie_id = m.id
        ORDER BY q.created_at DESC
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching quizzes:', error);
            return res.status(500).json({
                error: 'Error fetching quizzes',
                details: error.message
            });
        }

        res.status(200).json(results);
    });
};

// Lấy quiz theo ID
const getQuizById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT q.*, m.title as movie_title 
            FROM quizzes q
            JOIN movies m ON q.movie_id = m.id
            WHERE q.id = ?
        `;

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error fetching quiz:', error);
                return res.status(500).json({
                    error: 'Error fetching quiz',
                    details: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getQuizById:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật quiz
const updateQuiz = async (req, res) => {
    const { id } = req.params;
    const { movie_id, passage } = req.body;

    try {
        // Kiểm tra quiz tồn tại
        connection.query(
            'SELECT * FROM quizzes WHERE id = ?',
            [id],
            (error, quizResults) => {
                if (error) {
                    console.error('Error checking quiz:', error);
                    return res.status(500).json({
                        error: 'Error checking quiz',
                        details: error.message
                    });
                }

                if (quizResults.length === 0) {
                    return res.status(404).json({ message: 'Quiz not found' });
                }

                // Kiểm tra movie tồn tại
                connection.query(
                    'SELECT id FROM movies WHERE id = ?',
                    [movie_id],
                    (error, movieResults) => {
                        if (error) {
                            console.error('Error checking movie:', error);
                            return res.status(500).json({
                                error: 'Error checking movie',
                                details: error.message
                            });
                        }

                        if (movieResults.length === 0) {
                            return res.status(404).json({ message: 'Movie not found' });
                        }

                        // Cập nhật quiz
                        const query = `
                            UPDATE quizzes 
                            SET movie_id = ?, passage = ?
                            WHERE id = ?
                        `;

                        connection.query(
                            query,
                            [movie_id, passage, id],
                            (error, results) => {
                                if (error) {
                                    console.error('Error updating quiz:', error);
                                    return res.status(500).json({
                                        error: 'Error updating quiz',
                                        details: error.message
                                    });
                                }

                                res.status(200).json({ message: 'Quiz updated successfully' });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in updateQuiz:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Xóa quiz
const deleteQuiz = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM quizzes WHERE id = ?';

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error deleting quiz:', error);
                return res.status(500).json({
                    error: 'Error deleting quiz',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            res.status(200).json({ message: 'Quiz deleted successfully' });
        });
    } catch (error) {
        console.error('Error in deleteQuiz:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy quiz theo movie_id
const getQuizzesByMovie = async (req, res) => {
    const { movie_id } = req.params;

    try {
        const query = `
            SELECT q.*, m.title as movie_title 
            FROM quizzes q
            JOIN movies m ON q.movie_id = m.id
            WHERE q.movie_id = ?
        `;

        connection.query(query, [movie_id], (error, results) => {
            if (error) {
                console.error('Error fetching quizzes:', error);
                return res.status(500).json({
                    error: 'Error fetching quizzes',
                    details: error.message
                });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error in getQuizzesByMovie:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    addQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getQuizzesByMovie
};
