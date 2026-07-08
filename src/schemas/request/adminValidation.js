const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const kycIdSchema = z.object({

    params: z.object({

        id: z.string().regex(
            objectIdRegex,
            "Invalid MongoDB ObjectId"
        )

    })

});

module.exports = {
    kycIdSchema
};