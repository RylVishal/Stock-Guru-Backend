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
    chart,
    getLivePriceController,
    getLivePricesController
} = require("../controllers/marketController");
const validate = require("../middlewares/validate");
const { searchStockSchema, stockDetailsSchema, chartSchema } = require("../schemas/request/marketValidation");
const { livePriceParamsSchema, livePricesBodySchema } = require("../schemas/request/marketLivePriceValidation");


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
router.get("/search", validate(searchStockSchema), searchStocks);

router.get(
    "/chart/:symbol",
    validate(chartSchema),
    chart
);

router.get(
    "/live-price/:symbol",
    validate(livePriceParamsSchema),
    getLivePriceController
);

router.post(
    "/live-prices",
    validate(livePricesBodySchema),
    getLivePricesController
);

module.exports = router;
