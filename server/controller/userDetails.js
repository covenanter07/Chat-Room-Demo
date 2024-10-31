const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(req, res) {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new Error("No token provided");
        }

        const user = await getUserDetailsFromToken(token);

        return res.status(200).json({
            message: "User details",
            data: user
        });
    } catch (error) {
        let statusCode = 500;
        let message = error.message || "Internal server error";

        if (error.message === "No token provided" || error.message === "Invalid token" || error.message === "Token has expired") {
            statusCode = 401;
        } else if (error.message === "User not found") {
            statusCode = 404;
        }

        return res.status(statusCode).json({
            message: message,
            error: true
        });
    }
}

module.exports = userDetails;
