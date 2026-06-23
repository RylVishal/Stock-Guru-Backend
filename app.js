const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const kycRoutes = require("./routes/kycRoutes");
const adminRoutes = require("./routes/adminRoutes");
const marketRoutes = require("./routes/marketRoutes");
const healthRoutes = require("./routes/healthRoutes");
const PortfolioRoutes = require("./routes/portfolioRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/api/auth",authRoutes);
console.log("authRoutes:", authRoutes);

// console.log("errorMiddleware:..............:", errorMiddleware);
app.use( "/api/kyc",kycRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/market",marketRoutes);
app.use("/api/portfolio",PortfolioRoutes);
app.use(errorMiddleware);
app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use("/api/watchlist", watchlistRoutes);
app.use("/",healthRoutes);
module.exports = app;
