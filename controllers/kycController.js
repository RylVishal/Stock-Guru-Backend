const {
    submitKYC,
    getKYCStatus} = require("../services/kycService");

const submit = async(req,res,next)=>{

    try{
        const kyc =
        await submitKYC(
            req.user.id,
            req.body
        );
        res.status(201).json({
            success:true,
            kyc
        });
    }
    catch(err){

        next(err);
    }
};

const status = async(
    req,
    res,
    next
)=>{

    try{

        const result =
        await getKYCStatus(
            req.user.id
        );

        res.status(200).json(
            result
        );

    }
    catch(err){

        next(err);

    }
};

module.exports = {

    submit,

    status

};