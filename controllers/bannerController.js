const Banner = require("../models/Banner");
const { fileUploadCloud } = require("../utils/cloudinaryUpload"); // Assuming you're using a similar cloud upload utility
const CustomError = require("../errors");
const path = require("path");
const { StatusCodes } = require("http-status-codes");

const createBanner = async (req, res, next) => {
  try {
    // Check if a file is provided
    if (!req.file) {
      throw new CustomError.BadRequestError(
        "Please add an image for the banner."
      );
    }

    const maxSize = 3 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new CustomError.BadRequestError(
        "Please upload an image under 3MB."
      );
    }

    // Check if the file is an image
    if (!req.file.mimetype.startsWith("image")) {
      throw new CustomError.BadRequestError(
        "Please upload a valid image file."
      );
    }

    // Count existing banners
    const bannerCount = await Banner.countDocuments();
    if (bannerCount >= 4) {
      throw new CustomError.BadRequestError(
        "You can't upload more than 4 images."
      );
    }

    // Upload the image to Cloudinary
    const localFilePath = path.join(__dirname, "../uploads", req.file.filename);
    const result = await fileUploadCloud(localFilePath, 1200);

    if (!result) {
      throw new CustomError.BadRequestError(
        "Failed to upload image to Cloudinary."
      );
    }

    // Create the new banner
    const banner = await Banner.create({ image: result.secure_url });

    res
      .status(StatusCodes.CREATED)
      .json({ msg: "Banner created successfully" });
  } catch (error) {
    next(error);
  }
};

const getBanner = async (req, res) => {
  const banners = await Banner.find({});
  res.status(200).json({ banners });
};

module.exports = {
  createBanner,
  getBanner,
};
