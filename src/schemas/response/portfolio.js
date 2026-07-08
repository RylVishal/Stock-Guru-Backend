const { z } = require("zod");
const {
    createSuccessResponseSchema
} = require("./responseFactory");

const {

    HoldingSchema,

    TransactionSchema,

    SummarySchema,

    AnalyticsSchema

} = require("./models/portfolio");

const buyStockResponseSchema =
createSuccessResponseSchema(

    z.object({

        symbol:z.string(),

        companyName:z.string(),

        quantity:z.number(),

        price:z.number(),

        totalCost:z.number()

    })

);

const sellStockResponseSchema =
createSuccessResponseSchema(

    z.object({

        symbol:z.string(),

        quantity:z.number(),

        sellPrice:z.number(),

        saleAmount:z.number(),

        pnl:z.number()

    })

);

const holdingsResponseSchema =
createSuccessResponseSchema(

    z.array(
        HoldingSchema
    )

);

const historyResponseSchema =
createSuccessResponseSchema(

    z.array(
        TransactionSchema
    )

);

const summaryResponseSchema =
createSuccessResponseSchema(
    SummarySchema
);

const analyticsResponseSchema =
createSuccessResponseSchema(

    z.object({

        analytics:
            AnalyticsSchema,

        topWinner:
            HoldingSchema.nullable(),

        topLoser:
            HoldingSchema.nullable(),

        holdings:
            z.array(
                HoldingSchema
            )

    })

);

module.exports = {

    buyStockResponseSchema,

    sellStockResponseSchema,

    holdingsResponseSchema,

    historyResponseSchema,

    summaryResponseSchema,

    analyticsResponseSchema

};