const mongoose = require("mongoose");
const CustomError = require("../errors");

const BannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
});

const Banner = mongoose.model("Banner", BannerSchema);

module.exports = Banner;
