const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const config = require('../config/default');
const User = require('../models/User');

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = user.generateAuthToken();

        // Set the token as a cookie
        res.cookie(config.cookie.name, token, {
            maxAge: config.cookie.maxAge
        });

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email and include the password field
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = user.generateAuthToken();

        // Set the token as a cookie
        res.cookie(config.cookie.name, token, {
            maxAge: config.cookie.maxAge
        });

        // Send response
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie(config.cookie.name);

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user profile - Protected route
router.get('/me', userAuth, async (req, res) => {
    try {
        // Get user data from database (excluding password)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return the user data
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 