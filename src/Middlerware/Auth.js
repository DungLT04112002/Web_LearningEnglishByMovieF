// express-backend/middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticateToken = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded.user;

            // Check if user's role is in the allowed roles array
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Forbidden: Insufficient permissions"
                });
            }

            next();
        } catch (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
    };
};

module.exports = {
    authenticateToken
};