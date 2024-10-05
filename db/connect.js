const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 10000, // Set a timeout for the initial connection
        serverSelectionTimeoutMS: 10000, // Set a timeout for server selection
      }
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error: " + error);
    process.exit(1); // Exit the process with an error code if the connection fails
  }
};

module.exports = connectDB;
