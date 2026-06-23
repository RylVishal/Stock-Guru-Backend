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
/**
 * @swagger
 * /portfolio/buy:
 *   post:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     summary: Buy a stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             searchId: infosys-ltd
 *             quantity: 5
 *     responses:
 *       200:
 *         description: Stock purchased successfully
 */
router.post(
    "/buy",
    authMiddleware,
    buyStock
);
/**
 * @swagger
 * /portfolio/sell:
 *   post:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     summary: Sell a stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             symbol: INFY
 *             quantity: 5
 *     responses:
 *       200:
 *         description: Stock sold successfully
 */
router.post(
    "/sell",
    authMiddleware,
    sellStock
);
/**
 * @swagger
 * /portfolio/holdings:
 *   get:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     summary: Get holdings
 *     responses:
 *       200:
 *         description: Holdings fetched successfully
 */
router.get(
    "/holdings",
    authMiddleware,
    getHoldings
);
/**
 * @swagger
 * /portfolio/history:
 *   get:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     summary: Get transaction history
 *     responses:
 *       200:
 *         description: Transaction history
 */
router.get(
    "/history",
    authMiddleware,
    getHistory
);
/**
 * @swagger
 * /portfolio/summary:
 *   get:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     summary: Portfolio summary
 *     responses:
 *       200:
 *         description: Portfolio summary
 */
router.get(
    "/summary",
    authMiddleware,
    getSummary
);
/**
 * @swagger
 * /portfolio/analytics:
 *   get:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     summary: Portfolio analytics
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get(
    "/analytics",
    authMiddleware,
    getAnalytics
);


module.exports = router;