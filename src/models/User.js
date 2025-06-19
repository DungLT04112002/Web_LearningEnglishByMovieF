const connection = require('../config/database');

class User {
    static async create(userData) {
        const { email, name, birthdate, gender, role = 'user' } = userData;
        const sql = `
            INSERT INTO users (email, name, birthdate, gender, role)
            VALUES (?, ?, ?, ?, ?)
        `;
        const data = [email, name, birthdate, gender, role];

        return new Promise((resolve, reject) => {
            connection.query(sql, data, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';

        return new Promise((resolve, reject) => {
            connection.query(sql, [email], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    }

    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';

        return new Promise((resolve, reject) => {
            connection.query(sql, [id], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    }

    static async findAll() {
        const sql = 'SELECT id, email, name, avatar_url, birthdate, gender, role, created_at FROM users ORDER BY created_at DESC';

        return new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }

    static async update(id, userData) {
        const { name, birthdate, gender, role } = userData;
        const sql = `
            UPDATE users 
            SET name = ?, birthdate = ?, gender = ?, role = ?
            WHERE id = ?
        `;
        const data = [name, birthdate, gender, role, id];

        return new Promise((resolve, reject) => {
            connection.query(sql, data, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    static async updateAvatar(email, avatarUrl) {
        const sql = 'UPDATE users SET avatar_url = ? WHERE email = ?';

        return new Promise((resolve, reject) => {
            connection.query(sql, [avatarUrl, email], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';

        return new Promise((resolve, reject) => {
            connection.query(sql, [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = User;