const connection = require('../config/database');

class Movie {
    static async create(movieData) {
        const { title, description, thumbnail_url, video_url, release_year, genre, difficulty } = movieData;
        const sql = `
            INSERT INTO movies (title, description, thumbnail_url, video_url, release_year, genre, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const data = [title, description, thumbnail_url, video_url, release_year, genre, difficulty];

        return new Promise((resolve, reject) => {
            connection.query(sql, data, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    static async findAll() {
        const sql = 'SELECT * FROM movies ORDER BY created_at DESC';

        return new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }

    static async findById(id) {
        const sql = 'SELECT * FROM movies WHERE id = ?';

        return new Promise((resolve, reject) => {
            connection.query(sql, [id], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    }

    static async update(id, movieData) {
        const { title, description, thumbnail_url, video_url, release_year, genre, difficulty } = movieData;
        const sql = `
            UPDATE movies 
            SET title = ?, description = ?, thumbnail_url = ?, 
                video_url = ?, release_year = ?, genre = ?, difficulty = ?
            WHERE id = ?
        `;
        const data = [title, description, thumbnail_url, video_url, release_year, genre, difficulty, id];

        return new Promise((resolve, reject) => {
            connection.query(sql, data, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    static async delete(id) {
        const sql = 'DELETE FROM movies WHERE id = ?';

        return new Promise((resolve, reject) => {
            connection.query(sql, [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = Movie; 