const { z } = require("zod");

const addToWatchlistSchema = z.object({
    searchId: z.string().min(1)
});

module.exports = {
    addToWatchlistSchema
};