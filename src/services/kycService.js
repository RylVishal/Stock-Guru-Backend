const KYC = require("../models/KYC");
const AppError = require("../utils/AppError");

const submitKYC = async (userId, data) => {

    const existingKYC =
        await KYC.findOne({
            user: userId
        });

    if (existingKYC) {
        throw new AppError(
            "KYC already submitted",
            409
        );
    }

    const kyc = await KYC.create({
        user: userId,
        ...data
    });

    return {
    id: kyc._id.toString(),
    fullName: kyc.fullName,
    panNumber: kyc.panNumber,
    aadhaarNumber: kyc.aadhaarNumber,
    address: kyc.address,
    dob: kyc.dob.toISOString().split("T")[0],
    status: kyc.status
};
};

const getKYCStatus = async (userId) => {

    const kyc =
        await KYC.findOne({
            user: userId
        });

    if (!kyc) {
        throw new AppError(
            "KYC not found",
            404
        );
    }

    return {
        status: kyc.status
    };
};

const getKYCDetails = async (userId) => {
    const kyc = await KYC.findOne({ user: userId });
    if (!kyc) {
        throw new AppError("KYC not submitted yet", 404);
    }
    return {
        id: kyc._id.toString(),
        fullName: kyc.fullName,
        panNumber: kyc.panNumber,
        aadhaarNumber: kyc.aadhaarNumber,
        address: kyc.address,
        dob: kyc.dob ? kyc.dob.toISOString().split("T")[0] : null,
        status: kyc.status
    };
};

const updateKYCDetails = async (userId, updates) => {
    const kyc = await KYC.findOne({ user: userId });
    if (!kyc) {
        throw new AppError("KYC not found", 404);
    }

    // Only allow updating name, aadhaarNumber, address
    if (updates.fullName !== undefined) kyc.fullName = updates.fullName.trim();
    if (updates.aadhaarNumber !== undefined) kyc.aadhaarNumber = updates.aadhaarNumber.trim();
    if (updates.address !== undefined) kyc.address = updates.address.trim();

    await kyc.save();

    return {
        id: kyc._id.toString(),
        fullName: kyc.fullName,
        panNumber: kyc.panNumber,
        aadhaarNumber: kyc.aadhaarNumber,
        address: kyc.address,
        dob: kyc.dob ? kyc.dob.toISOString().split("T")[0] : null,
        status: kyc.status
    };
};

module.exports = {
    submitKYC,
    getKYCStatus,
    getKYCDetails,
    updateKYCDetails
};