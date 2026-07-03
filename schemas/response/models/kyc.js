const { z } = require("zod");

const KycSchema = z.object({
    id: z.string().optional(),
    fullName: z.string(),
    panNumber: z.string(),
    aadhaarNumber: z.string(),
    address: z.string(),
    dob: z.string(),
    status: z.enum([
        "pending",
        "approved",
        "rejected"
    ]),
    rejectionReason: z.string().nullable().optional(),
    createdAt: z.string().optional()
});

const KycStatusSchema = z.object({
    status: z.enum([
        "pending",
        "approved",
        "rejected"
    ])
});

module.exports = {
    KycSchema,
    KycStatusSchema
};