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
    getChart,
    candles
} = require("../controllers/marketController");
/**
 * @swagger
 * /market/most-bought:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Most Bought Stocks
 *     description: Returns the most bought stocks on Groww.
 *     responses:
 *       200:
 *         description: Most bought stocks fetched successfully
 */
router.get("/most-bought", mostBought);
/**
 * @swagger
 * /market/top-gainers:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Top Gainers
 *     description: Returns stocks with highest gains.
 *     responses:
 *       200:
 *         description: Top gainers fetched successfully
 */
router.get("/top-gainers", topGainers);
/**
 * @swagger
 * /market/top-losers:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Top Losers
 *     description: Returns stocks with highest losses.
 *     responses:
 *       200:
 *         description: Top losers fetched successfully
 */
router.get("/top-losers", topLosers);
/**
 * @swagger
 * /market/trending-sectors:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Trending Sectors
 *     description: Returns trending market sectors.
 *     responses:
 *       200:
 *         description: Trending sectors fetched successfully
 */
router.get("/trending-sectors", trendingSectors);
/**
 * @swagger
 * /market/news:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Market News
 *     description: Returns latest market news.
 *     responses:
 *       200:
 *         description: News fetched successfully
 */
router.get("/news", news);
/**
 * @swagger
 * /market/stock/{searchId}:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Stock Details
 *     description: Returns detailed company information.
 *     parameters:
 *       - in: path
 *         name: searchId
 *         required: true
 *         schema:
 *           type: string
 *         example: infosys-ltd
 *     responses:
 *       200:
 *         description: Stock details fetched successfully
 */
router.get("/stock/:searchId", stockDetails);
/**
 * @swagger
 * /market/search:
 *   get:
 *     tags:
 *       - Market
 *     summary: Search Stocks
 *     description: Search stocks by company name or symbol.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: infy
 *     responses:
 *       200:
 *         description: Search results returned successfully
 */
router.get("/search", searchStocks);
/**
 * @swagger
 * /market/chart/{symbol}:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Chart Data
 *     description: Returns simplified chart data for frontend line charts.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: INFY
 *     responses:
 *       200:
 *         description: Chart data fetched successfully
 */
router.get("/chart/:symbol", getChart);
/**
 * @swagger
 * /market/candles/{symbol}:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get OHLC Candlestick Data
 *     description: Returns OHLCV candle data for candlestick charts.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: INFY
 *     responses:
 *       200:
 *         description: Candle data fetched successfully
 */
router.get("/candles/:symbol",candles);
module.exports = router;