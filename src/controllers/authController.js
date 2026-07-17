const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyOTP,
    resetPassword,
    refreshAccessTokenService
} = require("../services/authService");

const { success } = require("../utils/responseBuilder");
const validateResponse = require("../middlewares/validateResponse");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const {
    registerResponseSchema,
    loginResponseSchema,
    messageResponseSchema
} = require("../schemas/response/auth");

const register = async (req, res, next) => {
    try {
        console.log("➡️ Controller entered");

        const user = await registerUser(req.body);

        console.log("➡️ Service returned");

        const response = success(
            "User created successfully",
            user
        );

        console.log("➡️ Response built");

        validateResponse(
            registerResponseSchema,
            response
        );

        console.log("➡️ Response validated");

        return res.status(201).json(response);

    } catch (err) {
        console.error(err);
        next(err);
    }
};
const login = async (req, res, next) => {
    try {

        const {
            email,
            password
        } = req.body;

        const data =
            await loginUser(email, password);

       const response = success(
    "Login successful",
    data
);

validateResponse(
    loginResponseSchema,
    response
);

return res
    .status(200)
    .json(response);

    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {

        await logoutUser(req.user.id);

const response = success(
    "User logged out successfully"
);

validateResponse(
    messageResponseSchema,
    response
);

return res
    .status(200)
    .json(response);
    } 
    catch (err) {
        next(err);
    }
};

const refreshAccessToken = async (
    req,
    res,
    next
) => {

    try {
        // Accept token from: httpOnly cookie, request body, or Authorization header
        const token =
            req.cookies?.refreshToken ||
            req.body?.refreshToken ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ status: 'error', message: 'Refresh token not found' });
        }

        const data =
            await refreshAccessTokenService(
                token
            );

        return res.status(200).json(
            success(
                "Access token refreshed successfully",
                data
            )
        );

    }

    catch(err){

        next(err);

    }

};

const forgotPasswordController = async (req, res, next) => {
    try {

        const { email } = req.body;

        await forgotPassword(email);

        const response = success(
    "OTP sent successfully"
);

validateResponse(
    messageResponseSchema,
    response
);

return res
    .status(200)
    .json(response);

    } catch (err) {
        next(err);
    }
};

const verifyOTPController = async (req, res, next) => {
    try {

        const {
            email,
            otp
        } = req.body;

        await verifyOTP(email, otp);

        const response = success(
    "OTP verified successfully"
);

validateResponse(
    messageResponseSchema,
    response
);

return res
    .status(200)
    .json(response);

    } catch (err) {
        next(err);
    }
};

const resetPasswordController = async (req, res, next) => {
    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;
        await resetPassword(
            email,
            otp,
            newPassword
        );

        const response = success(
    "Password reset successfully"
);

validateResponse(
    messageResponseSchema,
    response
);

return res
    .status(200)
    .json(response);

    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPasswordController,
    verifyOTPController,
    resetPasswordController,
    refreshAccessToken
};