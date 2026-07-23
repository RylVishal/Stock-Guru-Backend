const { z } = require("zod");

const HoldingSchema = z.object({
    id: z.string(),
    
    symbol: z.string(),

    companyName: z.string(),

    quantity: z.number(),

    avgPrice: z.number(),

    currentPrice: z.number().nullable(),

    investedValue: z.number().nullable(),

    currentValue: z.number().nullable(),

    pnl: z.number().nullable(),

    returnPercent: z.number().nullable()

});

const TransactionSchema = z.object({

    symbol: z.string(),

    companyName: z.string(),

    type: z.enum([
        "BUY",
        "SELL"
    ]),

    quantity: z.number(),

    price: z.number(),

    amount: z.number(),

    createdAt: z.string()

});

const SummarySchema = z.object({

    cashBalance: z.number(),

    totalInvested: z.number(),

    totalProfitLoss: z.number(),

    holdingsCount: z.number()

});

const AnalyticsSchema = z.object({

    portfolioValue: z.number(),

    investedValue: z.number(),

    unrealizedPnL: z.number(),

    returnPercentage: z.number(),

    cashBalance: z.number(),

    totalAccountValue: z.number()

});

module.exports = {

    HoldingSchema,

    TransactionSchema,

    SummarySchema,

    AnalyticsSchema

};