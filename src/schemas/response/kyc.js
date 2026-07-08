const {
    createSuccessResponseSchema
} = require("./responseFactory");

const {
    KycSchema,
    KycStatusSchema
} = require("./models/kyc");

const submitKycResponseSchema =
    createSuccessResponseSchema(
        KycSchema
    );

const kycStatusResponseSchema =
    createSuccessResponseSchema(
        KycStatusSchema
    );

module.exports = {
    submitKycResponseSchema,
    kycStatusResponseSchema
};