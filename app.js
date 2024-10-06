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
const connectDB = require("./db/connect");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Use your frontend URL here
    credentials: true, // Allow credentials (cookies) to be sent
  })
);
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(process.env.PORT || 8000, async () => {
  await connectDB();
  console.log(`Server listening at PORT: ${process.env.PORT}`);
});
