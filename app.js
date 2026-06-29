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

// 1. Core Global Middlewares
app.use(express.json());

// FIXED: Configured explicit CORS to completely allow multi-device local network handshakes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// FIXED: Adjusted Helmet to disable HTTPS upgrade policies over local network IPs
app.use(helmet({
  contentSecurityPolicy: false, // Disables strict asset upgrade requirements
  crossOriginOpenerPolicy: false, // Prevents untrustworthy origin warnings
  hsts: false // STOP forcing external network computers to rewrite links to HTTPS!
}));

// 2. Application Endpoint Routes
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/portfolio", PortfolioRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/", healthRoutes);

// 3. Interactive Documentation Swagger Config
// Uses dynamic local protocol references to guarantee plain http data mapping
const swaggerUiOptions = {
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    // Forces internal schemas to use plain http over network routes
    schemes: ['http']
  },
  // Tells Swagger-UI to explicitly fetch asset engines as relative files
  customCssUrl: '/api-docs/swagger-ui.css',
  customJs: [
    '/api-docs/swagger-ui-bundle.js',
    '/api-docs/swagger-ui-standalone-preset.js'
  ]
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// 4. Global Fallback Error Middleware Layer (Kept right before module export)
app.use(errorMiddleware);

module.exports = app;