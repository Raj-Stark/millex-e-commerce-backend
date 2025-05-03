const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils");

const getAllUser = async (req, res) => {
  const users = await User.find({}).select("-googleId");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-googleId");
  if (!user) {
    throw new CustomError.NotFoundError("No user found with this ID");
  }

  res.status(StatusCodes.OK).json({ user });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-googleId");
  if (!user) {
    throw new CustomError.NotFoundError("No user found with this ID");
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { name, email, phone, address } = req.body;

  console.log(req.body);

  if (
    Object.keys(req.body).length === 0 ||
    (address && Object.keys(address).length === 0)
  ) {
    throw new CustomError.BadRequestError("Provide values for update");
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  if (address) {
    user.address = {
      ...user.address,
      ...address,
    };
  }

  await user.save();

  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToResponse({ res, user: tokenUser });

  console.log("✅ User updated:", tokenUser); // helpful during dev

  res.status(StatusCodes.OK).json({
    msg: "User updated successfully",
    user,
  });
};

module.exports = {
  getAllUser,
  getCurrentUser,
  updateUser,
  getSingleUser,
};
