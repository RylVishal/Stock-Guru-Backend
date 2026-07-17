const nodemailer = require("nodemailer");
const env = require("../config/env");
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:env.EMAIL_USER,
        pass:env.EMAIL_PASS
    }
});

const sendOTPEmail = async(email,otp)=>{
    await transporter.sendMail({
        from:env.EMAIL_USER,
        to:email,
        subject:"Stock Guru Password Reset OTP",
        html:`
        <h1>Password Reset OTP </h1>
        <p> your otp is </p>
        <h2>${otp}</h2>
        `
    });
}

module.exports = {sendOTPEmail};
