const { z } = require("zod");

const addToWatchlistSchema = z.object({

    body: z.object({

        searchId: z.string().min(1)

    })

});

const removeFromWatchlistSchema = z.object({

    params: z.object({

        symbol: z.string().min(1)

    })

});

module.exports = {
    addToWatchlistSchema,
    removeFromWatchlistSchema
};  