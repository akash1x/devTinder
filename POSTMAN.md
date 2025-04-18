# DevTinder API Postman Collection

This document explains how to use the Postman collection to test the DevTinder API endpoints.

## Importing the Collection

1. Download the `DevTinder.postman_collection.json` file from the repository
2. Open Postman
3. Click on "Import" in the top left corner
4. Select the file you downloaded
5. Click "Import" to complete the process

## Base URL Configuration

The collection uses a variable for the base URL which is set to `http://localhost:7777` by default. If your server is running on a different port or host, you can change this:

1. Click on the "DevTinder API" collection in the Postman sidebar
2. Click on the "Variables" tab
3. Change the value in the "Current Value" column for `baseUrl`
4. Click "Save"

## Available Endpoints

### Authentication

#### Register User

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`
- Body (JSON):
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- Description: Creates a new user account

#### Login User

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`
- Body (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- Description: Authenticates an existing user and returns a token as a cookie

#### Logout User

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/logout`
- Description: Clears the authentication cookie

#### Get Current User

- Method: `GET`
- URL: `{{baseUrl}}/api/auth/me`
- Description: Returns information about the currently authenticated user
- Note: This is a protected route that requires authentication via cookie

## Cookie Authentication

Postman automatically handles cookies from the server. After you login:

1. Postman will store the cookie
2. Subsequent requests will automatically include the cookie
3. You can view cookies by clicking on "Cookies" in the bottom right corner of Postman

## Testing Flow

A typical testing flow:

1. Register a new user (`POST /api/auth/register`)
2. Login with the created user (`POST /api/auth/login`)
3. Get the user profile (`GET /api/auth/me`)
4. Logout (`POST /api/auth/logout`)
5. Try to access the protected route again to verify you're logged out
