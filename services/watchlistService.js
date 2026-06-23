const Watchlist = require("../models/Watchlist");
const { getCompanyDetails,getLivePrice } = require("./marketService");

const addToWatchlistService = async(userId, searchId)=>{

    const company =
        await getCompanyDetails(searchId);

    const symbol =
        company.header.nseScriptCode;

    const companyName =
        company.header.displayName;

    const exists =
        await Watchlist.findOne({
            userId,
            symbol
        });

    if(exists){
        throw new Error(
            "Already in watchlist"
        );
    }

    return await Watchlist.create({
        userId,
        searchId,
        symbol,
        companyName
    });
};

const getWatchlistService = async(userId)=>{

    const watchlist =
        await Watchlist.find({userId});

    const result =
        await Promise.all(
            watchlist.map(
                async(stock)=>{
                    const price =
                        await getLivePrice(
                            stock.symbol
                        );

                    return {
                        symbol: stock.symbol,
                        companyName:
                            stock.companyName,
                        searchId:
                            stock.searchId,
                        livePrice: price
                    };
                }
            )
        );

    return {
        success:true,
        watchlist: result
    };
};

const removeFromWatchlistService =
async(userId,symbol)=>{

    const stock =
        await Watchlist.findOne({
            userId,
            symbol
        });

    if(!stock){
        throw new Error(
            "Stock not found in watchlist"
        );
    }

    await Watchlist.deleteOne({
        _id: stock._id
    });

    return {
        success:true,
        message:
        "Removed from watchlist"
    };
};

module.exports = {
    addToWatchlistService,
    getWatchlistService,
    removeFromWatchlistService
};