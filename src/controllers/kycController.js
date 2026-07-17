
const {
    submitKYC,
    getKYCStatus,
    getKYCDetails,
    updateKYCDetails
} = require("../services/kycService");


const { success } = require("../utils/responseBuilder");
const validateResponse =
require("../middlewares/validateResponse");
 const {
    submitKycResponseSchema,
    kycStatusResponseSchema
} = require("../schemas/response/kyc");
const submit = async (req, res, next) => {

    try {

        const kyc = await submitKYC(
            req.user.id,
            req.body
        );

        const response = success(
    "KYC submitted successfully",
    kyc
);

validateResponse(
    submitKycResponseSchema,
    response
);

return res.status(201).json(response);

    } catch (err) {

        next(err);

    }

};

const status = async (req, res, next) => {

    try {

        const result = await getKYCStatus(
            req.user.id
        );

        const response = success(
    "KYC status fetched successfully",
    result
);

validateResponse(
    kycStatusResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {

        next(err);

    }

};

const getDetails = async (req, res, next) => {
    try {
        const result = await getKYCDetails(req.user.id);
        return res.status(200).json({
            status: "success",
            message: "KYC details fetched",
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const updateDetails = async (req, res, next) => {
    try {
        const { fullName, aadhaarNumber, address } = req.body;

        if (fullName !== undefined && (!fullName.trim() || /\d/.test(fullName))) {
            return res.status(400).json({ status: "error", message: "Invalid full name" });
        }
        if (aadhaarNumber !== undefined && !/^\d{12}$/.test(aadhaarNumber.trim())) {
            return res.status(400).json({ status: "error", message: "Aadhaar must be 12 digits" });
        }
        if (address !== undefined && !address.trim()) {
            return res.status(400).json({ status: "error", message: "Address cannot be empty" });
        }

        const result = await updateKYCDetails(req.user.id, { fullName, aadhaarNumber, address });
        return res.status(200).json({
            status: "success",
            message: "KYC details updated",
            data: result
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submit,
    status,
    getDetails,
    updateDetails
};