const {
    getMostBoughtStocks,
    getTopMovers,
    getTrendingSectors,
    getNews,
    getCompanyDetails,
    getLivePrice,
    searchStocks:searchStocksService,
    getChartData
} = require("../services/marketService");

const mostBought = async (req, res, next) => {
    try {
        const data = await getMostBoughtStocks();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const topGainers = async (req, res, next) => {
    try {
        const data = await getTopMovers("TOP_GAINERS");
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const topLosers = async (req, res, next) => {
    try {
        const data = await getTopMovers("TOP_LOSERS");
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const trendingSectors = async (req, res, next) => {
    try {
        const data = await getTrendingSectors();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const news = async (req, res, next) => {
    try {
        const data = await getNews();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const stockDetails = async (req, res, next) => {
    try {
        const { searchId } = req.params;

        const result =
            await getCompanyDetails(searchId);

        res.status(200).json(result);

    } catch (err) {
        next(err);
    }
};

const searchStocks = async (req, res, next) => {
    try {
        const { q } = req.query;

        const data =
            await searchStocksService(q);

        res.status(200).json(data);

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

        res.status(200).json(data);

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