const express = require("express");

const router =
    express.Router();

const authMiddleware =
require("../middlewares/authMiddleware");

const {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist
} = require(
    "../controllers/watchlistController"
);
/**
 * @swagger
 * /watchlist/add:
 *   post:
 *     tags:
 *       - Watchlist
 *     security:
 *       - bearerAuth: []
 *     summary: Add stock to watchlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             searchId: infosys-ltd
 */
router.post("/add",authMiddleware,addToWatchlist);
/**
 * @swagger
 * /watchlist:
 *   get:
 *     tags:
 *       - Watchlist
 *     security:
 *       - bearerAuth: []
 *     summary: Get user watchlist
 */
router.get("/",authMiddleware,getWatchlist);
/**
 * @swagger
 * /watchlist/{symbol}:
 *   delete:
 *     tags:
 *       - Watchlist
 *     security:
 *       - bearerAuth: []
 *     summary: Remove stock from watchlist
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: INFY
 *     responses:
 *       200:
 *         description: Removed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Removed from watchlist
 */
router.delete("/:symbol",authMiddleware,removeFromWatchlist);

module.exports = router;