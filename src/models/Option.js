const connection = require('../config/database');

class Option {
    static async create(optionData) {
        try {
            const { question_id, label, content } = optionData;

            // Validate required fields
            if (!question_id || !label || !content) {
                throw new Error('Missing required fields: question_id, label, content');
            }

            const sql = `
                INSERT INTO options (question_id, label, content)
                VALUES (?, ?, ?)
            `;
            const data = [question_id, label, content];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to create option: ' + err.message));
                        return;
                    }
                    if (!result || !result.insertId) {
                        reject(new Error('Failed to create option: No insert ID returned'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Option.create:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const sql = `
                SELECT o.*, q.question, q.quiz_id, qz.movie_id, m.title as movie_title 
                FROM options o
                JOIN questions q ON o.question_id = q.id
                JOIN quizzes qz ON q.quiz_id = qz.id
                JOIN movies m ON qz.movie_id = m.id
                ORDER BY o.id DESC
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch options: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Option.findAll:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = `
                SELECT o.*, q.question, q.quiz_id, qz.movie_id, m.title as movie_title 
                FROM options o
                JOIN questions q ON o.question_id = q.id
                JOIN quizzes qz ON q.quiz_id = qz.id
                JOIN movies m ON qz.movie_id = m.id
                WHERE o.id = ?
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch option: ' + err.message));
                        return;
                    }
                    if (!results || results.length === 0) {
                        reject(new Error('Option not found'));
                        return;
                    }
                    resolve(results[0]);
                });
            });
        } catch (error) {
            console.error('Error in Option.findById:', error);
            throw error;
        }
    }

    static async findByQuestionId(question_id) {
        try {
            const sql = `
                SELECT o.*, q.question, q.quiz_id, qz.movie_id, m.title as movie_title 
                FROM options o
                JOIN questions q ON o.question_id = q.id
                JOIN quizzes qz ON q.quiz_id = qz.id
                JOIN movies m ON qz.movie_id = m.id
                WHERE o.question_id = ?
                ORDER BY o.label ASC
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [question_id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch options: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Option.findByQuestionId:', error);
            throw error;
        }
    }

    static async update(id, optionData) {
        try {
            const { question_id, label, content } = optionData;

            // Validate required fields
            if (!question_id || !label || !content) {
                throw new Error('Missing required fields: question_id, label, content');
            }

            const sql = `
                UPDATE options 
                SET question_id = ?, label = ?, content = ?
                WHERE id = ?
            `;
            const data = [question_id, label, content, id];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to update option: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Option not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Option.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM options WHERE id = ?';

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to delete option: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Option not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Option.delete:', error);
            throw error;
        }
    }
}

module.exports = Option;