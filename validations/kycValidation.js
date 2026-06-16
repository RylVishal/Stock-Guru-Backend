const { z } = require("zod");

const kycSchema = z.object({
    fullName:z
    .string()
    .min(3),

    panNumber:z
    .string()
    .regex(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN Number"
    ),

    aadhaarNumber:z
    .string()
    .regex(
        /^[0-9]{12}$/,
        "Invalid Aadhaar Number"
    ),
        address:z
    .string()
    .min(10),

    dob:z
    .string()

});

module.exports = {
    kycSchema
};

