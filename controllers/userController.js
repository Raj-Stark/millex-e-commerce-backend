const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils");

const getAllUser = async (req, res) => {
  const users = (await User.find({})).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  const user = await User.findOne({ _id: userId }).populate('wishlist').select("-password");

  if (!user) {
    throw new CustomError.NotFoundError("No user found with this ID");
  }
  res.status(StatusCodes.OK).json({ user });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate('wishlist').select("-password");

  if (!user) {1
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

  const user = await User.findOne({ _id: req.user.userId });

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

  await user.save();m 

  res.status(StatusCodes.OK).json({ msg: "Success!" });
};

const toggleToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findOne({ _id: req.user.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wishlist = user.wishlist?.map((id) => id.toString()) ?? [];

    console.log("wishlist",wishlist,productId)

    const addToWishList = !wishlist.includes(productId);

    if (addToWishList) {``
      user.wishlist = [productId, ...wishlist];
    }
    else {
      user.wishlist = wishlist.filter((id) => id !== productId);
    }
    await user.save();
    res.json({ data: addToWishList, message: addToWishList? "Product added to wishlist":"Product removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUsersWishlist = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId }).populate("wishlist");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wishlist = user.wishlist ?? [];
    res.json({ wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getAllUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
  getSingleUser,
  toggleToWishlist,
  getUsersWishlist
};
