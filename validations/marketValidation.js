const { z } = require("zod");

const searchStockSchema = z.object({
    q:z.string().min(1)
});

module.exports = {
    searchStockSchema
};
