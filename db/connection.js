const mongoose = require('mongoose');
const config = require('../config/default');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 