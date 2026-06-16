const {

    getPendingKYCs,

    approveKYC,

    rejectKYC

} = require("../services/adminService");

const getPending = async(req,res,next)=>{
    try{

        const kycs = await getPendingKYCs();
        res.json(kycs);
    }
    catch(err){
        next(err);
    }
};

const approve = async(req,res,next)=>{
    try{
        const kyc = await approveKYC(req.params.id);
        res.json({
            success:true,
            kyc
        });

    }
    catch(err){
        next(err);
    }
};

const reject = async(req,res,next)=>{
    try{

        const result =
        await rejectKYC(req.params.id,req.body.reason);
        res.json({
            success:true,
            result
        });

    }
    catch(err){
        next(err);
    }
};

module.exports = {
    getPending,
    approve,
    reject
};