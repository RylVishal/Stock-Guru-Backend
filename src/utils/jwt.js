const env = require("../config/env");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user)=>{
    return jwt.sign(
        {
            id:user._id,
            role:user.role
        },
        env.JWT_SECRET,
        {
            expiresIn:"15m"
        }
    );
};


const generateRefreshToken = (user) =>{
    return jwt.sign(
        {
            id:user._id,
            role:user.role
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn:"7d"
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
