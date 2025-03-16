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
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/v1/order", orderRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(process.env.PORT || 8080, async () => {
  await connectDB();
  console.log(`Server listening at PORT: ${process.env.PORT}`);
});
