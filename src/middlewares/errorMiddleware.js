const { error } = require("../utils/responseBuilder");

const errorMiddleware = (err, req, res, next) => {

    if (err.name === "TokenExpiredError") {
        err.statusCode = 401;
        err.message = "Access token expired";
    }

    if (err.name === "JsonWebTokenError") {
        err.statusCode = 401;
        err.message = "Invalid access token";
    }

    return res
        .status(err.statusCode || 500)
        .json(
            error(
                err.message || "Internal Server Error",
                err.errors
            )
        );
};

module.exports = errorMiddleware;