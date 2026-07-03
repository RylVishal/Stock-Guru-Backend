const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { setupSwagger } = require("./docs/swagger");

const authRoutes = require("./routes/authRoutes");
const kycRoutes = require("./routes/kycRoutes");
const adminRoutes = require("./routes/adminRoutes");
const marketRoutes = require("./routes/marketRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const healthRoutes = require("./routes/healthRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

/* ------------------------- Global Middlewares ------------------------- */

app.use(express.json());

app.use(cors());

app.use(helmet());

/* ------------------------- Swagger ------------------------- */

setupSwagger(app);

/* ------------------------- Routes ------------------------- */

app.use("/api/auth", authRoutes);

app.use("/api/kyc", kycRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/market", marketRoutes);

app.use("/api/portfolio", portfolioRoutes);

app.use("/api/watchlist", watchlistRoutes);

app.use("/", healthRoutes);

/* ------------------------- Error Handler ------------------------- */

app.use(errorMiddleware);

module.exports = app;