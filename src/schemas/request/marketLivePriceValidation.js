const { z } = require("zod");

const symbolSchema = z
  .string()
  .trim()
  .min(1, "symbol is required")
  .max(20, "symbol too long");

const livePriceParamsSchema = z.object({
  symbol: symbolSchema.optional(),
});

const livePricesBodySchema = z.object({
  symbols: z
    .array(symbolSchema)
    .min(1, "symbols array cannot be empty")
    .max(50, "Too many symbols"),
});

module.exports = {
  livePriceParamsSchema,
  livePricesBodySchema,
};

