const jwt = require("jsonwebtoken");
const env = require("../config/env");
const authMiddleware = (req,res,next)=>{
try{
    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER:", authHeader);
    if(!authHeader){
        return res.status(401).json({
            message:"Token not found!"
        });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token,env.JWT_SECRET);
    // console.log("decoded.................................:",decoded);
    req.user = decoded;
    // console.log("req....................::",req)
    next();
}
    catch(err){
        return res.status(401).json({
            message:"Token Mismatch!"
        });
    }
};

module.exports = authMiddleware;