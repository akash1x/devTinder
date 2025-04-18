const express = require('express');
require('dotenv').config();
const config = require('./config/default');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connection');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const connectionRoutes = require('./routes/connections');

// Middleware
app.use(express.json());
app.use(cookieParser());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/connections', connectionRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        const PORT = process.env.PORT || config.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};

startServer(); 