const {
    addToWatchlistService,
    getWatchlistService,
    removeFromWatchlistService
} = require("../services/watchlistService");

const { success } = require("../utils/responseBuilder");
const validateResponse = require("../middlewares/validateResponse");
const {
    addWatchlistResponseSchema,
    watchlistResponseSchema,
    removeWatchlistResponseSchema
} = require("../schemas/response/watchlist");
const addToWatchlist = async (req, res, next) => {

    try {

        const { searchId } = req.body;

        const result =
            await addToWatchlistService(
                req.user.id,
                searchId
            );

        const response = success(
    "Stock added to watchlist",
    result
);

validateResponse(
    addWatchlistResponseSchema,
    response
);

return res.status(201).json(response);

    } catch (err) {

        next(err);

    }

};

const getWatchlist = async (req, res, next) => {

    try {

        const result =
            await getWatchlistService(
                req.user.id
            );

        const response = success(
    "Watchlist fetched successfully",
    result
);

validateResponse(
    watchlistResponseSchema,
    response
);

return res.status(200).json(response);

    } catch (err) {

        next(err);

    }

};

const removeFromWatchlist = async (req, res, next) => {

    try {

        const { symbol } = req.params;

        await removeFromWatchlistService(
            req.user.id,
            symbol
        );

        const response = success(
            "Removed from watchlist"
        );

        validateResponse(
            removeWatchlistResponseSchema,
            response
        );

        return res.status(200).json(response);

    } catch (err) {

        next(err);

    }

};
module.exports = {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist
};