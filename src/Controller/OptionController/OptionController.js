const connection = require('../../config/database');

// Thêm option mới
const addOption = async (req, res) => {
    const { question_id, label, content } = req.body;

    try {
        // Kiểm tra xem câu hỏi có tồn tại không
        connection.query(
            'SELECT id FROM questions WHERE id = ?',
            [question_id],
            (error, questionResults) => {
                if (error) {
                    console.error('Error checking question:', error);
                    return res.status(500).json({
                        error: 'Error checking question',
                        details: error.message
                    });
                }

                if (questionResults.length === 0) {
                    return res.status(404).json({ message: 'Question not found' });
                }

                // Thêm option mới
                const query = `
                    INSERT INTO options (question_id, label, content)
                    VALUES (?, ?, ?)
                `;

                connection.query(
                    query,
                    [question_id, label, content],
                    (error, results) => {
                        if (error) {
                            console.error('Error adding option:', error);
                            return res.status(500).json({
                                error: 'Error adding option',
                                details: error.message
                            });
                        }

                        res.status(201).json({
                            message: 'Option added successfully',
                            optionId: results.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in addOption:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy tất cả options
const getAllOptions = async (req, res) => {
    const query = `
        SELECT o.*, q.question, q.quiz_id, qz.movie_id, m.title as movie_title 
        FROM options o
        JOIN questions q ON o.question_id = q.id
        JOIN quizzes qz ON q.quiz_id = qz.id
        JOIN movies m ON qz.movie_id = m.id
        ORDER BY o.id DESC
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching options:', error);
            return res.status(500).json({
                error: 'Error fetching options',
                details: error.message
            });
        }

        res.status(200).json(results);
    });
};

// Lấy option theo ID
const getOptionById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT o.*, q.question, q.quiz_id, qz.movie_id, m.title as movie_title 
            FROM options o
            JOIN questions q ON o.question_id = q.id
            JOIN quizzes qz ON q.quiz_id = qz.id
            JOIN movies m ON qz.movie_id = m.id
            WHERE o.id = ?
        `;

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error fetching option:', error);
                return res.status(500).json({
                    error: 'Error fetching option',
                    details: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Option not found' });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getOptionById:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật option
const updateOption = async (req, res) => {
    const { id } = req.params;
    const { question_id, label, content } = req.body;

    try {
        // Kiểm tra option tồn tại
        connection.query(
            'SELECT * FROM options WHERE id = ?',
            [id],
            (error, optionResults) => {
                if (error) {
                    console.error('Error checking option:', error);
                    return res.status(500).json({
                        error: 'Error checking option',
                        details: error.message
                    });
                }

                if (optionResults.length === 0) {
                    return res.status(404).json({ message: 'Option not found' });
                }

                // Kiểm tra câu hỏi tồn tại
                connection.query(
                    'SELECT id FROM questions WHERE id = ?',
                    [question_id],
                    (error, questionResults) => {
                        if (error) {
                            console.error('Error checking question:', error);
                            return res.status(500).json({
                                error: 'Error checking question',
                                details: error.message
                            });
                        }

                        if (questionResults.length === 0) {
                            return res.status(404).json({ message: 'Question not found' });
                        }

                        // Cập nhật option
                        const query = `
                            UPDATE options 
                            SET question_id = ?, label = ?, content = ?
                            WHERE id = ?
                        `;

                        connection.query(
                            query,
                            [question_id, label, content, id],
                            (error, results) => {
                                if (error) {
                                    console.error('Error updating option:', error);
                                    return res.status(500).json({
                                        error: 'Error updating option',
                                        details: error.message
                                    });
                                }

                                res.status(200).json({ message: 'Option updated successfully' });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in updateOption:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Xóa option
const deleteOption = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM options WHERE id = ?';

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error deleting option:', error);
                return res.status(500).json({
                    error: 'Error deleting option',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Option not found' });
            }

            res.status(200).json({ message: 'Option deleted successfully' });
        });
    } catch (error) {
        console.error('Error in deleteOption:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy options theo question_id
const getOptionsByQuestion = async (req, res) => {
    const { question_id } = req.params;

    try {
        const query = `
            SELECT o.*, q.question, q.quiz_id, qz.movie_id, m.title as movie_title 
            FROM options o
            JOIN questions q ON o.question_id = q.id
            JOIN quizzes qz ON q.quiz_id = qz.id
            JOIN movies m ON qz.movie_id = m.id
            WHERE o.question_id = ?
            ORDER BY o.label ASC
        `;

        connection.query(query, [question_id], (error, results) => {
            if (error) {
                console.error('Error fetching options:', error);
                return res.status(500).json({
                    error: 'Error fetching options',
                    details: error.message
                });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error in getOptionsByQuestion:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    addOption,
    getAllOptions,
    getOptionById,
    updateOption,
    deleteOption,
    getOptionsByQuestion
};
