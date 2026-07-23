const { z } = require("zod");

const AddedWatchlistSchema = z.object({
    id: z.string(),
    searchId: z.string(),
    symbol: z.string(),
    companyName: z.string()
});

const WatchlistItemSchema = z.object({
    id: z.string(),
    searchId: z.string(),
    symbol: z.string(),
    companyName: z.string(),
    lastPrice: z.number().nullable()
});

module.exports = {
    AddedWatchlistSchema,
    WatchlistItemSchema
};