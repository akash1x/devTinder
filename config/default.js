module.exports = {
    port: 7777,

    jwt: {
        secret: process.env.JWT_SECRET || 'devtinder-secret-key',
        expiresIn: '1h'
    },

    cookie: {
        name: 'devtinder_token',
        maxAge: 3600000
    },

    mongodb: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/devTinderDB',
    }
}; 