const express = require("express");
const router = express.Router();

const {
   mostBought,
    topGainers,
    topLosers,
    trendingSectors,
    news,
    stockDetails,
    searchStocks,
    chart
} = require("../controllers/marketController");
const validate = require("../middlewares/validate");
const{searchStockSchema,stockDetailsSchema,chartSchema} = require("../schemas/request/marketValidation");

router.get("/most-bought", mostBought);
router.get("/top-gainers", topGainers);
router.get("/top-losers", topLosers);
router.get("/trending-sectors", trendingSectors);
router.get("/news", news);

router.get(
    "/stock/:searchId",
    validate(stockDetailsSchema),
    stockDetails
);
router.get("/search",validate(searchStockSchema),searchStocks);

router.get(
    "/chart/:symbol",
    validate(chartSchema),
    chart
);module.exports = router;