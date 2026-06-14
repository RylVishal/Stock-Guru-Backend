const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/api/auth",authRoutes);
console.log("authRoutes:", authRoutes);
// console.log("errorMiddleware:..............:", errorMiddleware);
app.use(errorMiddleware);

module.exports = app;
