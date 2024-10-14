const cloudinary = require("cloudinary").v2;

const CustomError = require("../errors");
const fs = require("fs");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const multerUpload = multer({ storage: storage }).single("myFile");

const handleFileUpload = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) {
      throw new CustomError.BadRequestError(
        "File upload failed. Please try again."
      );
    }
    next();
  });
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUploadCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    console.log(localFilePath);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "millex",
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
        },
      ],
    });

    if (result) {
      fs.unlinkSync(localFilePath);
    }

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
  }
};

module.exports = {
  handleFileUpload,
  fileUploadCloud,
};
