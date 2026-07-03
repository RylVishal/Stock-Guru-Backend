const {
    buyStockService,
    sellStockService,
    getHoldingsService,
    getHistoryService,
    getSummaryService,
    getAnalyticsService
} = require("../services/portfolioService");

const { success } = require("../utils/responseBuilder");
const validateResponse =
require("../middlewares/validateResponse");

const {

    buyStockResponseSchema,

    sellStockResponseSchema,

    holdingsResponseSchema,

    historyResponseSchema,

    summaryResponseSchema,

    analyticsResponseSchema

} = require("../schemas/response/portfolio");

const buyStock = async (req, res, next) => {
    try {

        const data =
            await buyStockService(
                req.user.id,
                req.body
            );

        const response = success(
    "Stock purchased successfully",
    data
);

validateResponse(
    buyStockResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {
        next(err);
    }
};

const sellStock = async (req, res, next) => {
    try {

        const data =
            await sellStockService(
                req.user.id,
                req.body
            );

       const response = success(
    "Stock sold successfully",
    data
);

validateResponse(
    sellStockResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {
        next(err);
    }
};

const getHoldings = async (req, res, next) => {
    try {

        const data =
            await getHoldingsService(
                req.user.id
            );

        const response = success(
    "Holdings fetched successfully",
    data
);

validateResponse(
    holdingsResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {
        next(err);
    }
};

const getHistory = async (req, res, next) => {
    try {

        const data =
            await getHistoryService(
                req.user.id
            );

        const response = success(
    "Transaction history fetched successfully",
    data
);

validateResponse(
    historyResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {
        next(err);
    }
};

const getSummary = async (req, res, next) => {
    try {

        const data =
            await getSummaryService(
                req.user.id
            );

        const response = success(
    "Portfolio summary fetched successfully",
    data
);

validateResponse(
    summaryResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {
        next(err);
    }
};

const getAnalytics = async (req, res, next) => {
    try {

        const data =
            await getAnalyticsService(
                req.user.id
            );

        const response = success(
    "Portfolio analytics fetched successfully",
    data
);

validateResponse(
    analyticsResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {
        next(err);
    }
};

module.exports = {
    buyStock,
    sellStock,
    getHoldings,
    getHistory,
    getSummary,
    getAnalytics
};