const mongoose = require('mongoose');

// Enum for connection request status
const ConnectionStatusEnum = {
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    INTERESTED: 'interested'
};

const ConnectionRequestSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'From user is required']
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'To user is required']
    },
    status: {
        type: String,
        enum: Object.values(ConnectionStatusEnum),
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This automatically adds and manages createdAt and updatedAt fields
});

// Create index to ensure a user can only send one pending connection request to another user
ConnectionRequestSchema.index(
    { fromUser: 1, toUser: 1 },
    { unique: true, partialFilterExpression: { status: ConnectionStatusEnum.PENDING } }
);

// Expose the enum values
ConnectionRequestSchema.statics.ConnectionStatusEnum = ConnectionStatusEnum;

const ConnectionRequest = mongoose.model('ConnectionRequest', ConnectionRequestSchema);

module.exports = ConnectionRequest; 