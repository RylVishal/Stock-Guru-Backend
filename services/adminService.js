const KYC = require("../models/KYC");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const getPendingKYCs = async () => {

    const kycs = await KYC.find({
        status: "pending"
    })
    .populate(
        "user",
        "name email"
    )
    .lean();

    return kycs.map((kyc) => ({

        id: kyc._id.toString(),

        user: {
            id: kyc.user._id.toString(),
            name: kyc.user.name,
            email: kyc.user.email
        },

        fullName: kyc.fullName,

        panNumber: kyc.panNumber,

        aadhaarNumber: kyc.aadhaarNumber,

        address: kyc.address,

        dob: kyc.dob.toISOString().split("T")[0],

        status: kyc.status,

        rejectionReason:
            kyc.rejectionReason ?? null,

        createdAt:
            kyc.createdAt.toISOString()

    }));

};
const approveKYC = async(kycId)=>{
    const kyc = await KYC.findById(kycId);
    if(!kyc){
        throw new AppError(
            "KYC not found",
            404
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
    return {
    id: kyc._id.toString(),
    fullName: kyc.fullName,
    panNumber: kyc.panNumber,
    aadhaarNumber: kyc.aadhaarNumber,
    address: kyc.address,
    dob: kyc.dob.toISOString().split("T")[0],
    status: kyc.status,
    rejectionReason: kyc.rejectionReason ?? null,
    createdAt: kyc.createdAt.toISOString()
};
};

  const rejectKYC = async(kycId,reason)=>{
    const kyc = await KYC.findById(kycId);
    if(!kyc){
        throw new AppError(
            "KYC not found!",
            404
        );
    }
    kyc.status = "rejected";
kyc.rejectionReason = reason;

await kyc.save();

return {
    id: kyc._id.toString(),
    fullName: kyc.fullName,
    panNumber: kyc.panNumber,
    aadhaarNumber: kyc.aadhaarNumber,
    address: kyc.address,
    dob: kyc.dob.toISOString().split("T")[0],
    status: kyc.status,
    rejectionReason: kyc.rejectionReason,
    createdAt: kyc.createdAt.toISOString()
};
  };

  module.exports = {
    getPendingKYCs,
    approveKYC,
    rejectKYC
  };