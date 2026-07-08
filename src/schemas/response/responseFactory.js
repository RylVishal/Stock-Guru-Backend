const { z } = require("zod");

const createMessageResponseSchema = () =>
    z.object({
        success: z.literal(true),
        message: z.string()
    });

const createSuccessResponseSchema = (dataSchema) =>
    z.object({
        success: z.literal(true),
        message: z.string(),
        data: dataSchema
    });

const createErrorResponseSchema = z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.any().optional()
});

module.exports = {
    createMessageResponseSchema,
    createSuccessResponseSchema,
    createErrorResponseSchema
};