
const {
    submitKYC,
    getKYCStatus
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

module.exports = {
    submit,
    status
};