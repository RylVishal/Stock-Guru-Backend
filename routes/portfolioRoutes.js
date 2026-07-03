const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middlewares/authMiddleware");

const {
    buyStock,
    sellStock,
    getHoldings,
    getHistory,
    getSummary,
    getAnalytics
} = require("../controllers/portfolioController");
const {buyStockSchema,sellStockSchema} = require("../schemas/request/portfolioValidation");
const validate = require("../middlewares/validate");
const kycMiddleware = require("../middlewares/kycMiddleware");
router.post(
    "/buy",
    authMiddleware,
    kycMiddleware,
    validate(buyStockSchema),
    buyStock
);
router.post(
    "/sell",
    authMiddleware,
    kycMiddleware,
    validate(sellStockSchema),
    sellStock
);
router.get(
    "/holdings",
    authMiddleware,
    getHoldings
);
router.get(
    "/history",
    authMiddleware,
    getHistory
);
router.get(
    "/summary",
    authMiddleware,
    getSummary
);
router.get(
    "/analytics",
    authMiddleware,
    getAnalytics
);


module.exports = router;