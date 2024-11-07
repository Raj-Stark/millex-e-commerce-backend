const cloudinary = require("cloudinary").v2;
const CustomError = require("../errors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads", { recursive: true });
}

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

// Multer middleware setup
const multerUpload = multer({ storage: storage }).single("myFile");
const multerMultiUpload = multer({
  storage: storage,
  limits: { files: 4 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      cb(
        new CustomError.BadRequestError("Please upload only image files"),
        false
      );
    }
    cb(null, true);
  },
}).array("images", 4);

// Handle single file upload
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

// Handle multiple files upload
const handleMultiUpload = (req, res, next) => {
  multerMultiUpload(req, res, (err) => {
    if (err) {
      throw new CustomError.BadRequestError(
        err.message || "File upload failed. Please try again."
      );
    }
    next();
  });
};

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Single file upload to Cloudinary
const fileUploadCloud = async (localFilePath, size) => {
  try {
    if (!localFilePath) return null;

    console.log(localFilePath);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "millex",
      transformation: [
        {
          width: size,
          height: size,
          crop: "limit",
        },
      ],
    });

    if (result) {
      fs.unlinkSync(localFilePath);
    }

    return result;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

// Multiple files upload to Cloudinary
const multiFileUploadCloud = async (files, size) => {
  try {
    if (!files || files.length === 0) return null;

    // Ensure we don't exceed 4 files
    if (files.length > 4) {
      throw new CustomError.BadRequestError("Maximum 4 files allowed");
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const localFilePath = file.path;

        const result = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
          folder: "millex",
          transformation: [
            {
              width: size,
              height: size,
              crop: "limit",
            },
          ],
        });

        // Clean up local file after successful upload
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }

        return result;
      } catch (error) {
        // Clean up local file if upload fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    // Clean up any remaining files
    files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw new CustomError.BadRequestError(
      `Multiple file upload failed: ${error.message}`
    );
  }
};

module.exports = {
  handleFileUpload,
  handleMultiUpload,
  fileUploadCloud,
  multiFileUploadCloud,
};
