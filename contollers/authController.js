const {registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyOTP,
    resetPassword } = require("../services/authService");

const register = async(req,res,next)=>{
    try{
        const user = await registerUser(req.body);
        res.status(201).json({
            message:"User created successfully",
            user
        });
    }
    catch(err){
        next(err);
    }
};

const login = async (req,res,next)=>{
  try{
   const {
        email,
        password
    } = req.body;
    const tokens = await loginUser(email,password);
    // console.log("TOKENS..............................:", tokens);
    return res.status(200).json(tokens);
  }
  catch(err){
    next(err);
  }
};

const logout = async (req,res,next)=>{
    try{
        // console.log("req.user:..........................."req.user);
        await logoutUser(req.user.id);
        res.status(200).json({
            message:"User LoggedOut"
        });
    }
    catch(err){
        next(err);
    }
};

const refreshAccessToken = async(req,res,next)=>{
    try{
        // logic later
    }
    catch(err){
        next(err);
    }
};

const forgotPasswordController = async(req,res,next)=>{
    try{
      const {email} = req.body;
      const result = await forgotPassword(email);
      res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};

const verifyOTPController = async(req,res,next)=>{
    try{
      const {email,otp} = req.body;
      const result = await verifyOTP(email,otp);
      res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};

const resetPasswordController = async(req,res,next)=>{
    try{
      const{email,otp,newpassword} = req.body;
      const result = await resetPassword(email,otp,newpassword);
      res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};
module.exports = {
    register,
    login,
    logout,
    forgotPasswordController,
    verifyOTPController,
    resetPasswordController
    // refreshAccessToken
};