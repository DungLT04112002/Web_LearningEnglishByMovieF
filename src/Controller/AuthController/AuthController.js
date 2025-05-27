const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

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

        const user = listUsers.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Email không tồn tại' });
        }

        const accessToken = jwt.sign(
            { user },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        return res.json({ accessToken });

    } catch (err) {
        console.error('Lỗi xác thực Google:', err);
        return res.status(401).json({ message: 'Xác thực Google thất bại' });
    }
};

module.exports = {
    LoginGoogle
};
