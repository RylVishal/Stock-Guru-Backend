const { z } = require("zod");

const objectIdSchema = z.string().length(24);

const moneySchema = z.number();

const percentageSchema = z.number();

const dateSchema = z.string().datetime().optional();

module.exports = {
    objectIdSchema,
    moneySchema,
    percentageSchema,
    dateSchema
};