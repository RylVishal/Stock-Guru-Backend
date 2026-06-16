const KYC = require("../models/KYC");
const User = require("../models/user");

const getPendingKYCs = async()=>{
    return await KYC.find({
        status:"pending"
    }).populate(
        "user",
        "name email"
    );
};

const approveKYC = async(kycId)=>{
    const kyc = await KYC.findById(kycId);
    if(!kyc){
        throw new Error(
            "KYC not found"
        );
    }
    kyc.status = "approved";
    await kyc.save();
    await User.findByIdAndUpdate(
        kyc.user,
        {
            kycVerified:true
        }
    );
    console.log("Kyc: ",kyc);
    return kyc;
};

  const rejectKYC = async(kycId,reason)=>{
    const kyc = await KYC.findById(kycId);
    if(!kyc){
        throw new Error(
            "KYC not found!"
        );
    }
    kyc.status = "rejected";
    await kyc.save();
    return{
        kyc,
        reason
    };
  };

  module.exports = {
    getPendingKYCs,
    approveKYC,
    rejectKYC
  };