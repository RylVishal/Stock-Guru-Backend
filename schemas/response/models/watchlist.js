const { z } = require("zod");

const AddedWatchlistSchema = z.object({
    id: z.string(),
    searchId: z.string(),
    symbol: z.string(),
    companyName: z.string()
});

const WatchlistItemSchema = z.object({
    searchId: z.string(),
    symbol: z.string(),
    companyName: z.string(),
    livePrice: z.number()
});

module.exports = {
    AddedWatchlistSchema,
    WatchlistItemSchema
};