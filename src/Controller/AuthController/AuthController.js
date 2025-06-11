const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const connection = require('../../config/database');

const client = new OAuth2Client("134627762597-cig5pd6j5po4m3msuq4qi2p29pp9evbk.apps.googleusercontent.com");

const listUsers = [
    { id: 1, email: "luutiendung04112002@gmail.com", role: 'admin' },
    { id: 2, email: "luutiendung0411@gmail.com", role: 'employee' },
];

const LoginGoogle = async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "134627762597-cig5pd6j5po4m3msuq4qi2p29pp9evbk.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // Query database to get user information
        const query = `
            SELECT id, email, name, role, avatar_url, birthdate, gender 
            FROM users 
            WHERE email = ?
        `;

        connection.query(query, [email], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Email không tồn tại' });
            }

            const user = results[0];

            // Create token with user information
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
                { expiresIn: '1h' }
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
        });

    } catch (err) {
        console.error('Lỗi xác thực Google:', err);
        return res.status(401).json({ message: 'Xác thực Google thất bại' });
    }
};

module.exports = {
    LoginGoogle
};
