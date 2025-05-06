const express = require("express");
require("dotenv").config();
require("express-async-errors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const notFoundHandler = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bannerRouter = require("./routes/bannerRoutes");
const orderRouter = require("./routes/orderRoutes");
const connectDB = require("./db/connect");

const app = express();

// ✅ CORS middleware
const allowedOrigins = [
  "http://localhost:3100",
  "http://localhost:3000",
  "https://www.farmgear.in",
  "https://dashboard.farmgear.in",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
  }

  next();
});

// ✅ Other middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));

// ✅ Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/v1/order", orderRouter);

// ✅ Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// ✅ Start server
app.listen(process.env.PORT || 8080, async () => {
  await connectDB();
  console.log(`🚀 Server listening at PORT: ${process.env.PORT}`);
});
