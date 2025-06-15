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

  if (
    Object.keys(req.body).length === 0 ||
    (address && Object.keys(address).length === 0)
  ) {
    throw new CustomError.BadRequestError("Provide values for update");
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (phone) updateFields.phone = phone;
  if (address) updateFields.address = address;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToResponse({ res, user: tokenUser });

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
