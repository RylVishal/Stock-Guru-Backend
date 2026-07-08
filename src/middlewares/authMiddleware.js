const jwt = require("jsonwebtoken");

const env = require("../config/env");

const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(
                "Authorization header missing",
                401
            );
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new AppError(
                "Invalid authorization format",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(
                "Access token missing",
                401
            );
        }

        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        );

        req.user = decoded;

        next();

    }

    catch (err) {

        next(err);

    }

};

module.exports = authMiddleware;