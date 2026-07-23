

const {
    getMostBoughtStocks,
    getTopMovers,
    getTrendingSectors,
    getNews,
    getCompanyDetails,
    searchStocks: searchStocksService,
    getChartData,
    getLivePrice
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

        const symbol = (
            data?.header?.nseScriptCode ||
            data?.header?.bseScriptCode ||
            data?.header?.symbol ||
            data?.symbol ||
            searchId?.toUpperCase()
        )?.toUpperCase()?.trim();

        if (symbol) {
            await redisClient.sAdd("trackedSymbols", symbol);
        }

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

const getLivePriceController = async (req, res, next) => {
    try {
        const symbol = req.params?.symbol || req.query?.symbol;

        const livePrice = await getLivePrice(symbol);

        // Keep API explicit: null means “unavailable”.
        const rounded = livePrice == null || !Number.isFinite(livePrice)
            ? null
            : Math.round(livePrice * 100) / 100;

        return res.status(200).json({ symbol, livePrice: rounded });
    } catch (err) {
        next(err);
    }
};

const getLivePricesController = async (req, res, next) => {
    try {
        const { symbols } = req.body;

        const results = await Promise.all(
            symbols.map(async (s) => {
                const livePrice = await getLivePrice(s);

                const rounded = Number.isFinite(livePrice)
                    ? Math.round(livePrice * 100) / 100
                    : null;
                return [s, rounded];
            })
        );

        const pricesBySymbol = Object.fromEntries(results);

        return res.status(200).json({ prices: pricesBySymbol });
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
    chart,
    getLivePriceController,
    getLivePricesController
};
