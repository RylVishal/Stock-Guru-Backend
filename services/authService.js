const User = require("../models/user");
const Portfolio = require("../models/portfolio");
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
const AppError = require("../utils/AppError");
const registerUser = async(data)=>{
  const validateData = registerSchema.parse(data);
  const {
    name,
    email,
    password
  } = data;

  const existinguser = await User.findOne({email});
  if(existinguser){
    throw new AppError(
        "User Already in Use",
         409
    );
  }
  const hashedPassword = await bcrypt.hash(password,10);

  const user = await User.create({
    name,
    email,
    password:hashedPassword
  });
  await Portfolio.create({
    userId:user._id,
    cashBalance:100000
  });
  
  return user;
}

const loginUser = async (email,password)=>{
    console.log("email:",email);
    const user = await User.findOne({email});
    if(!user){
        throw new AppError("User doesn't exist!",401);
    }
    const ismatch = await bcrypt.compare(password,user.password);
    if(!ismatch){
        throw new AppError("Password MisMatch",401);
    }
    const accessToken = generateAccessToken(user);
    console.log("accessToken............................:",accessToken);
    const refreshToken = generateRefreshToken(user);
    console.log("RefreshToken....................:",refreshToken)
    console.log("User.....",user);
    console.log("Email....",email);
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
            EX:300
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
        throw new AppError(
            "OTP Expired!",
             400
        );
    }
    if(storedOTP!==otp){
        throw new AppError(
            "Invalid OTP!",
            400
        );
    }
    return true;
}

const resetPassword = async(email,otp,newpassword) =>{
    const storedOTP = await redisClient.get(`otp:${email}`);
    if(!storedOTP||storedOTP!==otp){
        throw new AppError(
            "Invalid OTP",
            403
        );
    }
    const user = await User.findOne({email});
    if(!user){
        throw new AppError(
            "User not found!",
            400
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