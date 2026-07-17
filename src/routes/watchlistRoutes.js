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
const validate = require("../middlewares/validate");
const {addToWatchlistSchema,removeFromWatchlistSchema} = require("../schemas/request/watchlistValidation");
router.post("/add",authMiddleware,validate(addToWatchlistSchema),addToWatchlist);
router.get("/",authMiddleware,getWatchlist);
router.delete(
    "/:symbol",
    authMiddleware,
    validate(removeFromWatchlistSchema),
    removeFromWatchlist
);
module.exports = router;