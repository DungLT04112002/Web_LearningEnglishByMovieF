const connection = require('../config/database');

class Quiz {
    static async create(quizData) {
        try {
            const { movie_id, passage, quiz_type } = quizData;

            // Validate required fields
            if (!movie_id || !passage || !quiz_type) {
                throw new Error('Missing required fields: movie_id, passage, quiz_type');
            }

            const sql = `
                INSERT INTO quizzes (movie_id, passage, quiz_type)
                VALUES (?, ?, ?)
            `;
            const data = [movie_id, passage, quiz_type];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to create quiz: ' + err.message));
                        return;
                    }
                    if (!result || !result.insertId) {
                        reject(new Error('Failed to create quiz: No insert ID returned'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Quiz.create:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const sql = `
                SELECT q.*, m.title as movie_title 
                FROM quizzes q
                JOIN movies m ON q.movie_id = m.id
                ORDER BY q.created_at DESC
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch quizzes: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Quiz.findAll:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = `
                SELECT q.*, m.title as movie_title 
                FROM quizzes q
                JOIN movies m ON q.movie_id = m.id
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
                        reject(new Error('Failed to fetch quiz: ' + err.message));
                        return;
                    }
                    if (!results || results.length === 0) {
                        reject(new Error('Quiz not found'));
                        return;
                    }
                    resolve(results[0]);
                });
            });
        } catch (error) {
            console.error('Error in Quiz.findById:', error);
            throw error;
        }
    }

    static async findByMovieId(movie_id) {
        try {
            const sql = `
                SELECT q.*, m.title as movie_title 
                FROM quizzes q
                JOIN movies m ON q.movie_id = m.id
                WHERE q.movie_id = ?
                ORDER BY q.created_at DESC
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [movie_id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch quizzes: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Quiz.findByMovieId:', error);
            throw error;
        }
    }

    static async update(id, quizData) {
        try {
            const { movie_id, passage, quiz_type } = quizData;

            // Validate required fields
            if (!movie_id || !passage || !quiz_type) {
                throw new Error('Missing required fields: movie_id, passage, quiz_type');
            }

            const sql = `
                UPDATE quizzes 
                SET movie_id = ?, passage = ?, quiz_type = ?
                WHERE id = ?
            `;
            const data = [movie_id, passage, quiz_type, id];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to update quiz: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Quiz not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Quiz.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM quizzes WHERE id = ?';

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to delete quiz: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Quiz not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Quiz.delete:', error);
            throw error;
        }
    }
}

module.exports = Quiz;