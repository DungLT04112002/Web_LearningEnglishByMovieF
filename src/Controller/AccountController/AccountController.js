const connection = require('../../config/database');

// Lấy thông tin tài khoản
const getAccountInfo = async (req, res) => {
    const userEmail = req.user.email;

    try {
        const query = `
            SELECT id, email, name, avatar_url, birthdate, gender, created_at 
            FROM users 
            WHERE email = ?
        `;

        connection.query(query, [userEmail], (error, results) => {
            if (error) {
                console.error('Error fetching account info:', error);
                return res.status(500).json({
                    error: 'Error fetching account info',
                    details: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getAccountInfo:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy danh sách tất cả người dùng (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT id, email, name, avatar_url, birthdate, gender, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `;

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching users:', error);
                return res.status(500).json({
                    error: 'Error fetching users',
                    details: error.message
                });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật role của người dùng (Admin only)
const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role value' });
        }

        const query = `
            UPDATE users 
            SET role = ? 
            WHERE id = ?
        `;

        connection.query(query, [role, userId], (error, results) => {
            if (error) {
                console.error('Error updating user role:', error);
                return res.status(500).json({
                    error: 'Error updating user role',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User role updated successfully' });
        });
    } catch (error) {
        console.error('Error in updateUserRole:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật thông tin tài khoản
const updateAccountInfo = async (req, res) => {
    const userEmail = req.user.email;
    const { name, birthdate, gender } = req.body;

    try {
        // Validate input
        if (gender && !['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }

        const query = `
            UPDATE users 
            SET name = ?, birthdate = ?, gender = ? 
            WHERE email = ?
        `;

        connection.query(query, [name, birthdate, gender, userEmail], (error, results) => {
            if (error) {
                console.error('Error updating account:', error);
                return res.status(500).json({
                    error: 'Error updating account',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'Account updated successfully' });
        });
    } catch (error) {
        console.error('Error in updateAccountInfo:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Cập nhật avatar
const updateAvatar = async (req, res) => {
    const userEmail = req.user.email;
    const { avatar_url } = req.body;

    try {
        if (!avatar_url) {
            return res.status(400).json({ message: 'Avatar URL is required' });
        }

        const query = `
            UPDATE users 
            SET avatar_url = ? 
            WHERE email = ?
        `;

        connection.query(query, [avatar_url, userEmail], (error, results) => {
            if (error) {
                console.error('Error updating avatar:', error);
                return res.status(500).json({
                    error: 'Error updating avatar',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'Avatar updated successfully' });
        });
    } catch (error) {
        console.error('Error in updateAvatar:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Tạo tài khoản mới (Admin only)
const createUser = async (req, res) => {
    const { email, name, birthdate, gender, role } = req.body;

    try {
        // Validate input
        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required' });
        }

        if (role && !['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role value' });
        }

        if (gender && !['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }

        // Check if email already exists
        connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email],
            (error, results) => {
                if (error) {
                    console.error('Error checking email:', error);
                    return res.status(500).json({
                        error: 'Error checking email',
                        details: error.message
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({ message: 'Email already exists' });
                }

                // Create new user
                const query = `
                    INSERT INTO users (email, name, birthdate, gender, role)
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(
                    query,
                    [email, name, birthdate, gender, role || 'user'],
                    (error, results) => {
                        if (error) {
                            console.error('Error creating user:', error);
                            return res.status(500).json({
                                error: 'Error creating user',
                                details: error.message
                            });
                        }

                        res.status(201).json({
                            message: 'User created successfully',
                            userId: results.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    getAccountInfo,
    getAllUsers,
    updateUserRole,
    updateAccountInfo,
    updateAvatar,
    createUser
};
