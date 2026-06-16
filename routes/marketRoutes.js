const express = require("express");
const router = express.Router();
const {
    mostBought,
    topGainers,
    topLosers,
    trendingSectors,
    news
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
 *         description: Successfully fetched stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exploreCompanies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MarketStock'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stocks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MarketStock'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stocks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MarketStock'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/top-losers", topLosers);

/**
 * @swagger
 * /market/trending-sectors:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Trending Sectors
 *     description: Returns sectors with highest market movement.
 *     responses:
 *       200:
 *         description: Trending sectors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TrendingSector'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/trending-sectors", trendingSectors);

/**
 * @swagger
 * /market/news:
 *   get:
 *     tags:
 *       - Market
 *     summary: Get Market News
 *     description: Returns latest stock market news.
 *     responses:
 *       200:
 *         description: Market news fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MarketNews'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/news", news);

module.exports = router;