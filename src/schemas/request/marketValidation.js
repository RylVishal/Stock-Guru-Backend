const { z } = require("zod");

const stockDetailsSchema = z.object({
    params: z.object({
        searchId: z.string().min(1)
    })
});

const searchStockSchema = z.object({
    query: z.object({
        q: z.string().trim().min(1)
    })
});

const chartSchema = z.object({
    params: z.object({
        symbol: z.string().trim().min(1)
    }),

    query: z.object({
        range: z.enum([
            "1D",
            "1W",
            "1M",
            "3M",
            "6M",
            "1Y",
            "3Y",
            "5Y",
            "ALL"
        ]).default("1D"),

        type: z.enum([
            "line",
            "candlestick"
        ]).default("line")
    })
});

module.exports = {
    stockDetailsSchema,
    searchStockSchema,
    chartSchema
};