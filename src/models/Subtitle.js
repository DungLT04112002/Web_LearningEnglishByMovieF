const connection = require('../config/database');

class Subtitle {
    static async create(subtitleData) {
        try {
            const { movie_id, language, srt_content } = subtitleData;

            // Validate required fields
            if (!movie_id || !language || !srt_content) {
                throw new Error('Missing required fields: movie_id, language, srt_content');
            }

            const sql = `
                INSERT INTO subtitles (movie_id, language, srt_content)
                VALUES (?, ?, ?)
            `;
            const data = [movie_id, language, srt_content];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to create subtitle: ' + err.message));
                        return;
                    }
                    if (!result || !result.insertId) {
                        reject(new Error('Failed to create subtitle: No insert ID returned'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Subtitle.create:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const sql = 'SELECT * FROM subtitles';

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch subtitles: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Subtitle.findAll:', error);
            throw error;
        }
    }

    static async findByMovieId(movie_id) {
        try {
            const sql = `
                SELECT s.*, m.title as movie_title 
                FROM subtitles s
                JOIN movies m ON s.movie_id = m.id
                WHERE s.movie_id = ?
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [movie_id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch subtitles: ' + err.message));
                        return;
                    }
                    resolve(results || []);
                });
            });
        } catch (error) {
            console.error('Error in Subtitle.findByMovieId:', error);
            throw error;
        }
    }

    static async findByMovieIdAndLanguage(movie_id, language) {
        try {
            const sql = `
                SELECT * FROM subtitles 
                WHERE movie_id = ? AND language = ?
            `;

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [movie_id, language], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to fetch subtitle: ' + err.message));
                        return;
                    }
                    if (!results || results.length === 0) {
                        reject(new Error(`No subtitle found for language: ${language}`));
                        return;
                    }
                    resolve(results[0]);
                });
            });
        } catch (error) {
            console.error('Error in Subtitle.findByMovieIdAndLanguage:', error);
            throw error;
        }
    }

    static async update(id, subtitleData) {
        try {
            const { language, srt_content } = subtitleData;

            // Validate required fields
            if (!language || !srt_content) {
                throw new Error('Missing required fields: language, srt_content');
            }

            const sql = `
                UPDATE subtitles 
                SET language = ?, srt_content = ?
                WHERE id = ?
            `;
            const data = [language, srt_content, id];

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, data, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to update subtitle: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Subtitle not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Subtitle.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM subtitles WHERE id = ?';

            return new Promise((resolve, reject) => {
                if (!connection) {
                    reject(new Error('Database connection not available'));
                    return;
                }

                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(new Error('Failed to delete subtitle: ' + err.message));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        reject(new Error('Subtitle not found'));
                        return;
                    }
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error in Subtitle.delete:', error);
            throw error;
        }
    }
}

module.exports = Subtitle; 