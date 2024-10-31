const UserModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function checkPassword(req, res) {
    try {
        const { password, userId } = req.body;

        // Find user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true
            });
        }

        // Verify password
        const verifyPassword = await bcryptjs.compare(password, user.password);
        if (!verifyPassword) {
            return res.status(400).json({
                message: "Incorrect password",
                error: true
            });
        }

        // JWT payload
        const tokenData = {
            id: user._id,
            email: user.email
        };

        // Sign token
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1y' });

        // Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        // Set token in cookie and respond
        return res.cookie('token', token, cookieOptions).status(200).json({
            message: "Login successful",
            token: token,
            success: true
        });
    } catch (error) {
        console.error('Error in checkPassword:', error);
        return res.status(500).json({
            message: error.message || 'Internal Server Error',
            error: true
        });
    }
}

module.exports = checkPassword;
