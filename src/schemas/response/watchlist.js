const { z } = require("zod");

const {
    createSuccessResponseSchema,
    createMessageResponseSchema
} = require("./responseFactory");

const {
    AddedWatchlistSchema,
    WatchlistItemSchema
} = require("./models/watchlist");

const addWatchlistResponseSchema =
    createSuccessResponseSchema(
        AddedWatchlistSchema
    );

const watchlistResponseSchema =
    createSuccessResponseSchema(
        z.array(
            WatchlistItemSchema
        )
    );

const removeWatchlistResponseSchema =
    createMessageResponseSchema();

module.exports = {
    addWatchlistResponseSchema,
    watchlistResponseSchema,
    removeWatchlistResponseSchema
};