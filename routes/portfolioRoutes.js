const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const{
    buyStock,
    sellStock,
    getHoldings,
    getHistory,
    getSummary
} = require("../controllers/portfolioController");
const router = express.Router();
router.use(authMiddleware);

router.post("/buy",buyStock);
router.post("/sell",sellStock);
router.get("/holdings",getHoldings);
router.get("/history",getHistory);
router.get("/summary",getSummary);

module.exports = router;



