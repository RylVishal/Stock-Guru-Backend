const Watchlist = require("../models/Watchlist");
const {
    getCompanyDetails,
    getLivePrice
} = require("./marketService");
const redisClient = require("../config/redis");
const AppError = require("../utils/AppError");

const addToWatchlistService = async (
    userId,
    searchId
) => {
const company =
    await getCompanyDetails(searchId);

console.log("========== COMPANY ==========");
console.dir(company, { depth: null });

const symbol = (
    company?.header?.nseScriptCode ||
    company?.header?.bseScriptCode ||
    company?.header?.symbol ||
    company?.symbol ||
    searchId?.toUpperCase()
)?.toUpperCase()?.trim();

const companyName = (
    company?.header?.displayName ||
    company?.header?.companyName ||
    company?.companyName ||
    company?.header?.shortName ||
    symbol
)?.trim();
    const exists =
        await Watchlist.findOne({
            userId,
            symbol
        });

    if (exists) {

        throw new AppError(
            "Already in watchlist",
            409
        );

    }

    // Get current price for the stock
    let livePrice = null;
    try {
        livePrice = await getLivePrice(symbol);
    } catch (err) {
        console.error(`Failed to fetch initial price for ${symbol}:`, err.message);
        livePrice = null;
    }

    const watchlist =
        await Watchlist.create({

            userId,

            searchId,

            symbol,

            companyName,

            lastPrice: livePrice

        });

    await redisClient.sAdd(
        "trackedSymbols",
        symbol
    );

    return {

        id: watchlist._id.toString(),

        searchId,

        symbol,

        companyName

    };

};
const getWatchlistService = async (
    userId
) => {

    const watchlist =
        await Watchlist.find({
            userId
        });

    return await Promise.all(

        watchlist.map(
            async (stock) => {

                let livePrice = null;

                try {

                    livePrice =
                        await getLivePrice(
                            stock.symbol
                        );

                } catch (err) {

                    console.error(`Failed to fetch live price for ${stock.symbol}:`, err.message);

                    livePrice = null;

                }

                // If live price is valid, update the lastPrice in database
                if (livePrice !== null && livePrice !== undefined && Number.isFinite(Number(livePrice)) && Number(livePrice) > 0) {
                    try {
                        stock.lastPrice = Number(livePrice);
                        await stock.save();
                    } catch (saveErr) {
                        console.warn(`Failed to save lastPrice for ${stock.symbol}:`, saveErr.message);
                    }
                } else {
                    // Fallback to database's last known price if live price is unavailable
                    livePrice = stock.lastPrice || null;
                }

                return {

                    id:
                    stock._id.toString(),

                    symbol:
                    stock.symbol,

                    companyName:
                    stock.companyName,

                    searchId:
                    stock.searchId,

                    livePrice,

                    lastPrice:
                        stock.lastPrice || null

                };

            }
        )

    );

};
const removeFromWatchlistService = async (
    userId,
    symbol
) => {

    const stock =
        await Watchlist.findOne({
            userId,
            symbol
        });

    if (!stock) {
        throw new AppError(
            "Stock not found in watchlist",
            404
        );
    }

    await Watchlist.deleteOne({
        _id: stock._id
    });

    return null;
};

module.exports = {
    addToWatchlistService,
    getWatchlistService,
    removeFromWatchlistService
};