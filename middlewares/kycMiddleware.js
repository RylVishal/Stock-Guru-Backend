const User = require("../models/user");
const AppError = require("../utils/AppError");

const kycMiddleware = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        if (!user.kycVerified) {
            throw new AppError(
                "Your KYC is pending approval. Trading is available only after verification.",
                403
            );
        }

        next();

    } catch (err) {
        next(err);
    }

};

module.exports = kycMiddleware;