const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const User = require('../models/User');

// Get user profile - Protected route
router.get('/view', userAuth, async (req, res) => {
    try {
        // Get user data from database (excluding password)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Return the user profile data
        res.status(200).json({
            success: true,
            profile: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
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

// Edit profile - Protected route
router.patch('/edit', userAuth, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        // Define allowed fields to update
        const allowedUpdates = ['firstName', 'lastName'];

        // Check if any field in request is not allowed
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({
                success: false,
                message: 'Invalid updates. Only firstName and lastName can be updated.',
                allowedUpdates
            });
        }

        // Find user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        updates.forEach(update => {
            const value = req.body[update];
            user[update] = value;
        });

        // Save updated user
        await user.save();

        // Return updated user data
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
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

// Update password - Protected route
router.patch('/password', userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        // Minimum password length validation
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find user with password
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;

        // Save user with new password (will be hashed by pre-save hook)
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
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