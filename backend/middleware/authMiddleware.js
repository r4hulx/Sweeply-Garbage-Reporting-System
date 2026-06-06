const jwt = require('jsonwebtoken');
const User = require('../models/User.js'); // Make sure the path is correct

const protect = async (req, res, next) => {
    let token;

    // Check if the request has an Authorization header, and if it starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header (e.g., "Bearer eyJhbGci...")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get user from the token's ID and attach it to the request object
            // We exclude the password from being attached
            req.user = await User.findById(decoded.id).select('-password');

            // 4. Move on to the next function (the actual controller)
            next();

        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };