
// const errorMiddleware = (err,req,res,next)=>{
//     res.status(err.statusCode||500).json({
//         success:false,
//         message:err.message||"Internal server error!"
//     });
// };

// module.exports = errorMiddleware;



const errorMiddleware = (err,req,res,next)=>{
    const statusCode = err.statusCode||500;
    res.status(statusCode).json({
        success:false,
        status:err.status||"error!",
        message:
             err.message||"Internal Server error"
    });
};
module.exports = errorMiddleware;

