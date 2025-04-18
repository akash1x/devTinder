# DevTinder

A developer matching platform where developers can connect with each other for collaboration, built with Node.js, Express, and MongoDB.

## Features

- User authentication using JWT tokens stored in cookies
- MongoDB integration with Mongoose ODM
- Secure password hashing with bcrypt
- RESTful API for user management

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile (protected route)

## Installation

1. Clone the repository:

```
git clone https://github.com/akash1x/devTinder.git
```

2. Install dependencies:

```
npm install
```

3. Make sure MongoDB is running on your local machine

4. Start the server:

```
npm run dev
```

By default, the server will run on port 7777.

## Environment Variables

The following environment variables can be set:

- `PORT` - Server port (default: 7777)
- `MONGO_URI` - MongoDB connection string (default: mongodb://localhost:27017/devtinder)
- `JWT_SECRET` - Secret key for JWT token generation

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Cookie-based authentication
