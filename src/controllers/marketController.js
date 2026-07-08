const {
    getMostBoughtStocks,
    getTopMovers,
    getTrendingSectors,
    getNews,
    getCompanyDetails,
    searchStocks: searchStocksService,
    getChartData
} = require("../services/marketService");

const redisClient = require("../config/redis");

const mostBought = async (req, res, next) => {
    try {
        const data = await getMostBoughtStocks();
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const topGainers = async (req, res, next) => {
    try {
        const data = await getTopMovers("TOP_GAINERS");
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const topLosers = async (req, res, next) => {
    try {
        const data = await getTopMovers("TOP_LOSERS");
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const trendingSectors = async (req, res, next) => {
    try {
        const data = await getTrendingSectors();
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const news = async (req, res, next) => {
    try {
        const data = await getNews();
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const stockDetails = async (req, res, next) => {
    try {
        const { searchId } = req.params;

        const data = await getCompanyDetails(searchId);

        await redisClient.sAdd(
            "trackedSymbols",
            data.header.nseScriptCode
        );

        return res.status(200).json(data);

    } catch (err) {
        next(err);
    }
};

const searchStocks = async (req, res, next) => {
    try {
        const { q } = req.query;

        const data =
            await searchStocksService(q);

        return res.status(200).json(data);

    } catch (err) {
        next(err);
    }
};

const chart = async (req, res, next) => {
    try {

        const { symbol } = req.params;

        const {
            range = "1D",
            type = "line"
        } = req.query;

        const data = await getChartData(
            symbol,
            range,
            type
        );

        return res.status(200).json(data);

    } catch (err) {
        next(err);
    }
};

module.exports = {
    mostBought,
    topGainers,
    topLosers,
    trendingSectors,
    news,
    stockDetails,
    searchStocks,
    chart
};