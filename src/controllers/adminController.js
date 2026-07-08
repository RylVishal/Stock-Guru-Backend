const {
    getPendingKYCs,
    approveKYC,
    rejectKYC
} = require("../services/adminService");

const { success } = require("../utils/responseBuilder");
const validateResponse =
require("../middlewares/validateResponse");
const {
    pendingKycResponseSchema,
    approveKycResponseSchema,
    rejectKycResponseSchema
} = require("../schemas/response/admin");

const getPending = async (req, res, next) => {

    try {

        const kycs = await getPendingKYCs();

        const response = success(
            "Pending KYC fetched successfully",
            kycs
        );

        validateResponse(
            pendingKycResponseSchema,
            response
        );

        return res
            .status(200)
            .json(response);

    } catch (err) {

        next(err);

    }

};
const approve = async (req, res, next) => {

    try {

        const kyc = await approveKYC(
            req.params.id
        );

        const response = success(
    "KYC approved successfully",
    kyc
);

validateResponse(
    approveKycResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {

        next(err);

    }

};

const reject = async (req, res, next) => {

    try {

        const result = await rejectKYC(
            req.params.id,
            req.body.reason
        );

        const response = success(
    "KYC rejected successfully",
    result
);

validateResponse(
    rejectKycResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {

        next(err);

    }

};

module.exports = {
    getPending,
    approve,
    reject
};