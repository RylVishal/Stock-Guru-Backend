const Holding = require("../models/holding");
const Watchlist = require("../models/Watchlist");
const redisClient = require("../config/redis");

const bootstrapTrackedSymbols = async () => {

    const holdings =
        await Holding.find({}, "symbol");

    const watchlist =
        await Watchlist.find({}, "symbol");

    const symbols = [

        ...holdings.map(h => h.symbol),

        ...watchlist.map(w => w.symbol)

    ];

    const uniqueSymbols =
        [...new Set(symbols)];

    if (uniqueSymbols.length) {

        await redisClient.sAdd(
            "trackedSymbols",
            uniqueSymbols
        );

    }

    console.log(
        `Bootstrapped ${uniqueSymbols.length} symbols`
    );

};

module.exports = bootstrapTrackedSymbols;