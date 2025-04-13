const express = require("express");
require("dotenv").config();
require("express-async-errors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

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

const allowedOrigins = [
  "http://localhost:3000",
  "https://farmgear.in",
  "https://www.farmgear.in",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🚦 Incoming CORS request from origin:", origin); // 🔍 log this
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
};

//! temp changes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  console.log("✅ Custom CORS headers set");
  next();
});

//! app.use(cors(corsOptions)); // ✅ MUST be at the top
app.options("*", cors(corsOptions)); // ✅ Handle preflight before any routes

// ✅ Other middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());

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
