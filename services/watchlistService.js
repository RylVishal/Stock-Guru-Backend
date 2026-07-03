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

const symbol =
    company.header.nseScriptCode;

console.log("Symbol:", symbol);

const companyName =
    company.header.displayName;

console.log("Company Name:", companyName);
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

    const watchlist =
        await Watchlist.create({

            userId,

            searchId,

            symbol,

            companyName

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

                const livePrice =
                    await getLivePrice(
                        stock.symbol
                    );

                return {

                    id:
                    stock._id.toString(),

                    symbol:
                    stock.symbol,

                    companyName:
                    stock.companyName,

                    searchId:
                    stock.searchId,

                    livePrice

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