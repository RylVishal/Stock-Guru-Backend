const { z } = require("zod");

const UserProfileSchema =
z.object({

    id:z.string(),

    name:z.string(),

    email:z.string(),

    role:z.enum([
        "user",
        "admin"
    ]),

    kycStatus:z.enum([
        "NOT_SUBMITTED",
        "PENDING",
        "APPROVED",
        "REJECTED"
    ]),

    panNumber:
        z.string()
        .nullable(),

    createdAt:
        z.string()

});

module.exports = {
    UserProfileSchema
};