const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

async function getUserDetailsFromToken(token) {
    if (!token) {
        console.error('No token provided');
        throw new Error('No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            console.error('User not found for token:', token);
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token has expired:', error);
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            console.error('Invalid token:', error);
            throw new Error('Invalid token');
        } else {
            console.error('Error getting user details from token:', error);
            throw new Error('Error getting user details from token');
        }
    }
}

module.exports = getUserDetailsFromToken;