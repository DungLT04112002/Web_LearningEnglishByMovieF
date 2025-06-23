const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const connection = require('../../config/database');

const client = new OAuth2Client("134627762597-cig5pd6j5po4m3msuq4qi2p29pp9evbk.apps.googleusercontent.com");

const LoginGoogle = async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "134627762597-cig5pd6j5po4m3msuq4qi2p29pp9evbk.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        const query = `
            SELECT id, email, name, role, avatar_url, birthdate, gender 
            FROM users 
            WHERE email = ?
        `;

        const processLogin = (user) => {
            const accessToken = jwt.sign(
                {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar_url: user.avatar_url,
                        birthdate: user.birthdate,
                        gender: user.gender
                    }
                },
                process.env.SECRET_KEY,
                { expiresIn: '5h' }
            );

            return res.json({
                accessToken,
                user: {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar_url: user.avatar_url
                }
            });
        };

        connection.query(query, [email], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length > 0) {
                // Tài khoản tồn tại cho phép login
                const user = results[0];
                return processLogin(user);
            } else {
                // Tài khoản không tồn tại thêm tài khoàn này vào 
                const newUser = {
                    email,
                    name,
                    avatar_url: picture,
                    role: 'user' // role
                };
                const insertQuery = 'INSERT INTO users SET ?';

                connection.query(insertQuery, newUser, (insertError) => {
                    if (insertError) {
                        return res.status(500).json({ message: 'Failed to create user' });
                    }
                    const userForToken = {
                        ...newUser,
                        birthdate: null,
                        gender: null
                    };
                    return processLogin(userForToken);
                });
            }
        });

    } catch (err) {
        console.error('Lỗi xác thực Google:', err);
        return res.status(401).json({ message: 'Xác thực Google thất bại' });
    }
};

module.exports = {
    LoginGoogle
};
