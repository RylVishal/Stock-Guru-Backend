const User =
require("../models/user");

const KYC =
require("../models/KYC");

const AppError =
require("../utils/AppError");

const getProfileService =
async(userId)=>{

    const user =
    await User.findById(userId);

    if(!user){

        throw new AppError(
            "User not found",
            404
        );

    }

    const kyc =
    await KYC.findOne({
        userId
    });

    return {

        id: user._id.toString(),

        name: user.name,

        email: user.email,

        role: user.role,

        kycStatus:
            kyc
            ? kyc.status
            : "NOT_SUBMITTED",

        panNumber:
            kyc
            ? kyc.panNumber
            : null,

        createdAt:
            user.createdAt.toISOString()

    };

};

module.exports = {
    getProfileService
};