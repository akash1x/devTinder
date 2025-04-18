const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

/**
 * @route   POST /api/connections/request
 * @desc    Send a connection request to another user
 * @access  Private
 */
router.post('/request', userAuth, async (req, res) => {
    try {
        const { toUserId, message } = req.body;
        const fromUserId = req.user.id;

        // Validate toUserId
        if (!toUserId) {
            return res.status(400).json({
                success: false,
                message: 'Target user ID is required'
            });
        }

        // Check if trying to connect to self
        if (fromUserId === toUserId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot send a connection request to yourself'
            });
        }

        // Check if target user exists
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }

        // Check if a request already exists
        const existingRequest = await ConnectionRequest.findOne({
            fromUser: fromUserId,
            toUser: toUserId
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'A connection request already exists',
                status: existingRequest.status
            });
        }

        // Create new connection request
        const connectionRequest = new ConnectionRequest({
            fromUser: fromUserId,
            toUser: toUserId,
            message: message || '',
            status: ConnectionRequest.ConnectionStatusEnum.INTERESTED
        });

        await connectionRequest.save();

        res.status(201).json({
            success: true,
            message: 'Connection request sent successfully',
            request: {
                id: connectionRequest._id,
                fromUser: connectionRequest.fromUser,
                toUser: connectionRequest.toUser,
                status: connectionRequest.status,
                createdAt: connectionRequest.createdAt
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

/**
 * @route   GET /api/connections/requests/received
 * @desc    Get all connection requests received by the user
 * @access  Private
 */
router.get('/requests/received', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all connection requests where user is the recipient
        const connectionRequests = await ConnectionRequest.find({ toUser: userId })
            .populate('fromUser', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: connectionRequests.length,
            requests: connectionRequests
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

/**
 * @route   GET /api/connections/requests/sent
 * @desc    Get all connection requests sent by the user
 * @access  Private
 */
router.get('/requests/sent', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all connection requests where user is the sender
        const connectionRequests = await ConnectionRequest.find({ fromUser: userId })
            .populate('toUser', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: connectionRequests.length,
            requests: connectionRequests
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

/**
 * @route   PATCH /api/connections/requests/:requestId
 * @desc    Update the status of a connection request
 * @access  Private
 */
router.patch('/requests/:requestId', userAuth, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Validate status - only allow ACCEPTED or REJECTED
        const validStatuses = [
            ConnectionRequest.ConnectionStatusEnum.ACCEPTED,
            ConnectionRequest.ConnectionStatusEnum.REJECTED
        ];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value. Status must be either "accepted" or "rejected"',
                validStatuses
            });
        }

        // Find the connection request
        const connectionRequest = await ConnectionRequest.findById(requestId);

        if (!connectionRequest) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found'
            });
        }

        // Check if the user is authorized to update this request
        if (connectionRequest.toUser.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this connection request'
            });
        }

        // Update the status
        connectionRequest.status = status;
        await connectionRequest.save();

        res.status(200).json({
            success: true,
            message: `Connection request ${status}`,
            request: {
                id: connectionRequest._id,
                fromUser: connectionRequest.fromUser,
                toUser: connectionRequest.toUser,
                status: connectionRequest.status,
                updatedAt: connectionRequest.updatedAt
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

/**
 * @route   GET /api/connections
 * @desc    Get all connections (accepted requests)
 * @access  Private
 */
router.get('/', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all accepted connection requests where user is either sender or recipient
        const sentConnections = await ConnectionRequest.find({
            fromUser: userId,
            status: ConnectionRequest.ConnectionStatusEnum.ACCEPTED
        }).populate('toUser', 'username email');

        const receivedConnections = await ConnectionRequest.find({
            toUser: userId,
            status: ConnectionRequest.ConnectionStatusEnum.ACCEPTED
        }).populate('fromUser', 'username email');

        // Format connections to have a consistent structure
        const connections = [
            ...sentConnections.map(conn => ({
                id: conn._id,
                user: conn.toUser,
                requestDirection: 'sent',
                createdAt: conn.createdAt,
                updatedAt: conn.updatedAt
            })),
            ...receivedConnections.map(conn => ({
                id: conn._id,
                user: conn.fromUser,
                requestDirection: 'received',
                createdAt: conn.createdAt,
                updatedAt: conn.updatedAt
            }))
        ];

        res.status(200).json({
            success: true,
            count: connections.length,
            connections
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