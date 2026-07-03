const { z } = require("zod");

const {
    createSuccessResponseSchema
} = require("./responseFactory");

const {
    PendingKycSchema
} = require("./models/admin");

const pendingKycResponseSchema =
    createSuccessResponseSchema(
        z.array(
            PendingKycSchema
        )
    );

const approveKycResponseSchema =
    createSuccessResponseSchema(
        PendingKycSchema
    );

const rejectKycResponseSchema =
    createSuccessResponseSchema(
        PendingKycSchema
    );

module.exports = {
    pendingKycResponseSchema,
    approveKycResponseSchema,
    rejectKycResponseSchema
};