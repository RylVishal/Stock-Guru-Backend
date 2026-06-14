const User = require("../models/user");
const bcrypt = require("bcryptjs");
const {registerSchema} = require("../validations/authValidation");
const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/jwt");

const redisClient = require("../config/redis");
const {sendOTPEmail} = require("./emailService");
const generateOTP = require("../utils/otpGenerator");
const {resetPasswordSchema} = require("../validations/authValidation")
// console.log("USER =", User);
// console.log("TYPE =", typeof User);
// console.log("findOne =", User.findOne);
const registerUser = async(data)=>{
  const validateData = registerSchema.parse(data);
  const {
    name,
    email,
    password
  } = data;

  const existinguser = await User.findOne({email});
  if(existinguser){
    throw new Error(
        "User Already in Use"
    );
  }
  const hashedPassword = await bcrypt.hash(password,10);

  const user = await User.create({
    name,
    email,
    password:hashedPassword
  });

  return user;
}

const loginUser = async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("User doesn't exist!");
    }
    const ismatch = await bcrypt.compare(password,user.password);
    if(!ismatch){
        throw new Error("Password MisMatch");
    }
    const accessToken = generateAccessToken(user._id);
    // console.log("accessToken............................:"accessToken);
    const refreshToken = generateRefreshToken(user._id);
    // console.log("RefreshToken....................:",refreshToken)
    user.refreshToken = refreshToken;
    await user.save();
    return{
        accessToken,
        refreshToken
    };
};

const logoutUser = async (user_id)=>{
    await User.findByIdAndUpdate(
        user_id,
        {
            refreshToken:null
        }
    );
};

const forgotPassword = async (email)=>{
    const doesEmailExist = await User.findOne({email});
    if(!doesEmailExist){
        throw new Error(
            "User not found"
        );
    }
    const otp = generateOTP();
    await redisClient.set(
        `otp:${email}`,
        otp,
        {
            EX:3000
        }
    );
    await sendOTPEmail(email,otp);
    return {
        message:"OTP sent successfully!"
    };
};

// const forgotPassword = async(email)=>{

//     console.log("Received Email:", email);

//     const allUsers = await User.find();

//     console.log("All Users:");
//     console.log(allUsers.map(u => u.email));

//     const user = await User.findOne({ email });

//     console.log("Found User:", user);

//     if(!user){
//         throw new Error("User not found");
//     }

//     return user;
// };
const verifyOTP = async(email,otp)=>{
    const storedOTP = await redisClient.get(`otp:${email}`);
    console.log("stordotp:",storedOTP)
    if(!storedOTP){
        throw new Error(
            "OTP Expired!"
        );
    }
    if(storedOTP!==otp){
        throw new Error(
            "Invalid OTP!"
        );
    }
    return true;
}

const resetPassword = async(email,otp,newpassword) =>{
    const storedOTP = await redisClient.get(`otp:${email}`);
    if(!storedOTP||storedOTP!==otp){
        throw new Error(
            "Invalid OTP"
        );
    }
    const user = await User.findOne({email});
    if(!user){
        throw new Error(
            "User not found!"
        );
    }
    const {password} = resetPasswordSchema.parse({
        password:newpassword
    });
    const hashedPassword = await bcrypt.hash(password,10);
    user.password = hashedPassword;
    await user.save();
    await redisClient.del(`otp:${email}`);
    return{
        message:"Password reset was successfull"
    };
    
} 

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyOTP,
    resetPassword
};