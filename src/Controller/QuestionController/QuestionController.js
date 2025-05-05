const connection = require('../../config/database');

// Thêm câu hỏi mới
const addQuestion = async (req, res) => {
    const { quiz_id, question, answer, explanation, quote } = req.body;

    try {
        // Kiểm tra xem quiz có tồn tại không
        connection.query(
            'SELECT id FROM quizzes WHERE id = ?',
            [quiz_id],
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

                // Thêm câu hỏi mới
                const query = `
                    INSERT INTO questions (quiz_id, question, answer, explanation, quote)
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(
                    query,
                    [quiz_id, question, answer, explanation, quote],
                    (error, results) => {
                        if (error) {
                            console.error('Error adding question:', error);
                            return res.status(500).json({
                                error: 'Error adding question',
                                details: error.message
                            });
                        }

                        res.status(201).json({
                            message: 'Question added successfully',
                            questionId: results.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in addQuestion:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy tất cả câu hỏi
const getAllQuestions = async (req, res) => {
    const query = `
        SELECT q.*, qz.movie_id, m.title as movie_title 
        FROM questions q
        JOIN quizzes qz ON q.quiz_id = qz.id
        JOIN movies m ON qz.movie_id = m.id
        ORDER BY q.id DESC
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({
                error: 'Error fetching questions',
                details: error.message
            });
        }

        res.status(200).json(results);
    });
};

// Lấy câu hỏi theo ID
const getQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT q.*, qz.movie_id, m.title as movie_title 
            FROM questions q
            JOIN quizzes qz ON q.quiz_id = qz.id
            JOIN movies m ON qz.movie_id = m.id
            WHERE q.id = ?
        `;

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error fetching question:', error);
                return res.status(500).json({
                    error: 'Error fetching question',
                    details: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Question not found' });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getQuestionById:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật câu hỏi
const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { quiz_id, question, answer, explanation, quote } = req.body;

    try {
        // Kiểm tra câu hỏi tồn tại
        connection.query(
            'SELECT * FROM questions WHERE id = ?',
            [id],
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

                // Kiểm tra quiz tồn tại
                connection.query(
                    'SELECT id FROM quizzes WHERE id = ?',
                    [quiz_id],
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

                        // Cập nhật câu hỏi
                        const query = `
                            UPDATE questions 
                            SET quiz_id = ?, question = ?, answer = ?, explanation = ?, quote = ?
                            WHERE id = ?
                        `;

                        connection.query(
                            query,
                            [quiz_id, question, answer, explanation, quote, id],
                            (error, results) => {
                                if (error) {
                                    console.error('Error updating question:', error);
                                    return res.status(500).json({
                                        error: 'Error updating question',
                                        details: error.message
                                    });
                                }

                                res.status(200).json({ message: 'Question updated successfully' });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in updateQuestion:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Xóa câu hỏi
const deleteQuestion = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM questions WHERE id = ?';

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error deleting question:', error);
                return res.status(500).json({
                    error: 'Error deleting question',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Question not found' });
            }

            res.status(200).json({ message: 'Question deleted successfully' });
        });
    } catch (error) {
        console.error('Error in deleteQuestion:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy câu hỏi theo quiz_id
const getQuestionsByQuiz = async (req, res) => {
    const { quiz_id } = req.params;

    try {
        const query = `
            SELECT q.*, qz.movie_id, m.title as movie_title 
            FROM questions q
            JOIN quizzes qz ON q.quiz_id = qz.id
            JOIN movies m ON qz.movie_id = m.id
            WHERE q.quiz_id = ?
        `;

        connection.query(query, [quiz_id], (error, results) => {
            if (error) {
                console.error('Error fetching questions:', error);
                return res.status(500).json({
                    error: 'Error fetching questions',
                    details: error.message
                });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error in getQuestionsByQuiz:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    addQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getQuestionsByQuiz
};
