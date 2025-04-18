const jwt = require('jsonwebtoken');
const config = require('../config/default');

// Get JWT secret
const JWT_SECRET = config.jwt.secret;

/**
 * Middleware to authenticate users via JWT token
 * Extracts token from cookies, verifies it,
 * and attaches the user data to the request object
 */
const userAuth = (req, res, next) => {
    // Get token from cookie
    const token = req.cookies[config.cookie.name];

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload to request object
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token. Authorization denied.'
        });
    }
};

module.exports = { userAuth }; 