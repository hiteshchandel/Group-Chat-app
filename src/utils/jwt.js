const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRE_IN = process.env.JWT_EXPIRES_IN;

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            mobile: user.mobile
        },
        SECRET_KEY,
        { expiresIn: EXPIRE_IN }
    );
}

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}

function verifyTokenSocket(token) {
    try {
        const user = jwt.verify(token, SECRET_KEY);
        return user; 
    } catch (err) {
        throw new Error("Invalid token");
    }
}

module.exports = {
    generateToken,
    verifyToken,
    verifyTokenSocket
};
