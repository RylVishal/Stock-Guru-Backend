const User = require("../models/user");
const Portfolio = require("../models/portfolio");
const bcrypt = require("bcryptjs");

const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/jwt");

const redisClient = require("../config/redis");
const { sendOTPEmail } = require("./emailService");
const generateOTP = require("../utils/otpGenerator");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const refreshAccessTokenService =
async(refreshToken)=>{

    if(!refreshToken){

        throw new AppError(
            "Refresh token missing",
            401
        );

    }

    let payload;

    try{

        payload =
        jwt.verify(
            refreshToken,
            env.JWT_REFRESH_SECRET
        );

    }

    catch(err){

        throw new AppError(
            err.name === 'TokenExpiredError'
                ? "Refresh token expired, please login again"
                : "Invalid refresh token",
            401
        );

    }

    const user =
    await User.findById(
        payload.id
    );

    if(!user){

        throw new AppError(
            "User not found",
            404
        );

    }

    // Issue new access token
    const accessToken =
    generateAccessToken(user);

    // Rotate the refresh token and persist — keeps DB in sync
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
        accessToken,
        refreshToken: newRefreshToken
    };

};
const registerUser = async (data) => {

    const {
        name,
        email,
        password
    } = data;
           console.log("➡️ Controller entered");
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError(
            "User already exists",
            409
        );
    }
    console.log("2");
    const hashedPassword =
        await bcrypt.hash(password, 10);
    console.log("3");
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });
    console.log("4");
    await Portfolio.create({
        userId: user._id,
        cashBalance: 100000
    });
    console.log("5");
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email
    };
};

const loginUser = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(
            "User doesn't exist",
            401
        );
    }

    const isMatch =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isMatch) {
        throw new AppError(
            "Password mismatch",
            401
        );
    }

    const accessToken =
        generateAccessToken(user);

    const refreshToken =
        generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    return {
    accessToken,
    refreshToken,
    user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        kycVerified: user.kycVerified
    }
};
};

const logoutUser = async (userId) => {

    await User.findByIdAndUpdate(
        userId,
        {
            refreshToken: null
        }
    );

    return null;
};

const forgotPassword = async (email) => {

    const user = await User.findOne({
        email
    });

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    const otp = generateOTP();

    await redisClient.set(
        `otp:${email}`,
        otp,
        {
            EX: 300
        }
    );

    await sendOTPEmail(email, otp);

    return null;
};

const verifyOTP = async (email, otp) => {

    const storedOTP =
        await redisClient.get(
            `otp:${email}`
        );

    if (!storedOTP) {
        throw new AppError(
            "OTP expired",
            400
        );
    }

    if (storedOTP !== otp) {
        throw new AppError(
            "Invalid OTP",
            400
        );
    }

    return null;
};

const resetPassword = async (
    email,
    otp,
    newpassword
) => {


    const storedOTP =
        await redisClient.get(
            `otp:${email}`
        );

    if (!storedOTP) {
        throw new AppError(
            "OTP expired",
            400
        );
    }

    if (storedOTP !== otp) {
        throw new AppError(
            "Invalid OTP",
            400
        );
    }

    const user = await User.findOne({
        email
    });

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            newpassword,
            10
        );

    user.password = hashedPassword;
    user.refreshToken = null;

    await user.save();

    await redisClient.del(
        `otp:${email}`
    );

    return null;
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyOTP,
    resetPassword,
    refreshAccessTokenService
};