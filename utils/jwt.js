const env = require("../config/env");
const jwt = require("jsonwebtoken");

const generateAccessToken = (u_id)=>{
    return jwt.sign(
        {
            id:u_id
        },
        env.JWT_SECRET,
        {
            expiresIn:"15m"
        }
    );
};


const generateRefreshToken = (u_id) =>{
    return jwt.sign(
        {
            id:u_id
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
