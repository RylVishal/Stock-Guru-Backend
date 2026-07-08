require("dotenv").config();

module.exports = {
    PORT:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    EMAIL_USER:process.env.EMAIL_USER,
    EMAIL_PASS:process.env.EMAIL_PASS,
    REDIS_URL:process.env.REDIS_URL
};
