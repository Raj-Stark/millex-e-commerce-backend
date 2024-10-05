const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils");

const getAllUser = async (req, res) => {
  res.send("Get all user");
  const users = (await User.find({})).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError("No user found with this ID");
  }
  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { name, email, address } = req.body;

  if (
    Object.keys(req.body).length === 0 ||
    (address && Object.keys(address).length === 0)
  ) {
    throw new CustomError.BadRequestError("Provide values for update");
  }

  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  if (name) user.name = name;
  if (email) user.email = email;

  if (address) {
    user.address = {
      ...user.address,
      ...address,
    };
  }
  await user.save();

  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide old & new passwords to update !"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.checkPassword({ password: oldPassword });

  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError("Invalid old Password");
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Success!" });
};

module.exports = {
  getAllUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
};
