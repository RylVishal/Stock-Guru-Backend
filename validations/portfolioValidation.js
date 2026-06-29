const { z } = require("zod");

const buyStockSchema = z.object({
    searchId: z.string().min(1),
    quantity: z.number().int().positive()
});

const sellStockSchema = z.object({
    searchId: z.string().min(1),
    quantity: z.number().int().positive()
});

module.exports = {
    buyStockSchema,
    sellStockSchema
};