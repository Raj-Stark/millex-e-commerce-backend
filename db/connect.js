const { default: mongoose } = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
  } catch (error) {
    console.log("MongoDB connection error " + error);
  }
};

module.exports = connectDB;
