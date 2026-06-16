const KYC = require("../models/KYC");
const { kycSchema } = require("../validations/kycValidation");

const submitKYC = async(userId,data)=>{

    const validatedData =
    kycSchema.parse(data);

    const existingKYC =
    await KYC.findOne({
        user:userId
    });

    if(existingKYC){
        throw new Error(
            "KYC already submitted"
        );
    }
 console.log("Validated Data:", validatedData);
    const kyc = await KYC.create({
           user:userId,
        ...validatedData
    });

    return kyc;
};

const getKYCStatus = async(userId)=>{

    const kyc = await KYC.findOne({
        user:userId
    });

    if(!kyc){
        throw new Error(
            "KYC not found"
        );
    }

    return {
        status:kyc.status
    };
};

module.exports = {
    submitKYC,
    getKYCStatus
};