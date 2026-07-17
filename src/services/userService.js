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
        user: userId
    });

    return {

        id: user._id.toString(),

        name: user.name,

        email: user.email,

        role: user.role,

        kycStatus:
            kyc
            ? kyc.status.toUpperCase()
            : "NOT_SUBMITTED",

        panNumber:
            kyc
            ? kyc.panNumber
            : null,

        createdAt:
            user.createdAt.toISOString()

    };

};

const updateProfileService = async (userId, data) => {
    const { name, panNumber } = data;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (name) {
        user.name = name;
        await user.save();
    }

    if (panNumber) {
        let kyc = await KYC.findOne({ user: userId });
        if (kyc) {
            kyc.panNumber = panNumber.toUpperCase();
            kyc.fullName = name || kyc.fullName || user.name;
            await kyc.save();
        } else {
            kyc = await KYC.create({
                user: userId,
                fullName: name || user.name,
                panNumber: panNumber.toUpperCase(),
                aadhaarNumber: "Not Submitted",
                address: "Not Submitted",
                dob: new Date(),
                status: "pending"
            });
        }
    }

    return getProfileService(userId);
};

module.exports = {
    getProfileService,
    updateProfileService
};