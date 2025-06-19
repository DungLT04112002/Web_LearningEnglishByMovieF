const connection = require('../config/database');

class Question {
    static async create(questionData) {
        try {
            const { quiz_id, question, answer, explanation, quote } = questionData;

            // Validate required fields
            if (!quiz_id || !question) {
                throw new Error('Missing required fields: quiz_id, question');
            }

            const sql = `
                INSERT INTO questions (quiz_id, question, answer, explanation, quote)
                VALUES (?, ?, ?, ?, ?)
            `;
            const data = [quiz_id, question, answer, explanation, quote];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to create question: ' + err.message));
                        return;
                    }
                    if (!result || !result.insertId) {
                        reject(new Error('Failed to create question: No insert ID returned'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Question.create:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const sql = `
                SELECT q.*, qz.movie_id, m.title as movie_title 
                FROM questions q
                JOIN quizzes qz ON q.quiz_id = qz.id
                JOIN movies m ON qz.movie_id = m.id
                ORDER BY q.id DESC
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch questions: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Question.findAll:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = `
                SELECT q.*, qz.movie_id, m.title as movie_title 
                FROM questions q
                JOIN quizzes qz ON q.quiz_id = qz.id
                JOIN movies m ON qz.movie_id = m.id
                WHERE q.id = ?
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch question: ' + err.message));
                        return;
                    }
                    if (!results || results.length === 0) {
                        reject(new Error('Question not found'));
                        return;
                    }
                    resolve(results[0]);
                });
            });
        } catch (error) {
            console.error('Error in Question.findById:', error);
            throw error;
        }
    }

    static async findByQuizId(quiz_id) {
        try {
            const sql = `
                SELECT q.*, qz.movie_id, m.title as movie_title 
                FROM questions q
                JOIN quizzes qz ON q.quiz_id = qz.id
                JOIN movies m ON qz.movie_id = m.id
                WHERE q.quiz_id = ?
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [quiz_id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch questions: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Question.findByQuizId:', error);
            throw error;
        }
    }

    static async update(id, questionData) {
        try {
            const { quiz_id, question, answer, explanation, quote } = questionData;

            // Validate required fields
            if (!quiz_id || !question) {
                throw new Error('Missing required fields: quiz_id, question');
            }

            const sql = `
                UPDATE questions 
                SET quiz_id = ?, question = ?, answer = ?, explanation = ?, quote = ?
                WHERE id = ?
            `;
            const data = [quiz_id, question, answer, explanation, quote, id];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to update question: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Question not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Question.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM questions WHERE id = ?';

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to delete question: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Question not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Question.delete:', error);
            throw error;
        }
    }
}

module.exports = Question;