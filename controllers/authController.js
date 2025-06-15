const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesToResponse } = require("../utils");

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "postmessage",
});

const ADMIN_EMAILS = ["vishalpj1144@gmail.com", "rpal778866@gmail.com"];

// 🔄 Shared function to verify token and extract payload
const getPayloadFromCode = async (code) => {
  if (!code) {
    throw new CustomError.BadRequestError("Authorization code is missing");
  }

  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;
  if (!idToken) {
    throw new CustomError.UnauthenticatedError("Invalid Google token");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
};

// 🌐 Public Google login (any verified user)
const googleLogin = async (req, res) => {
  try {
    const payload = await getPayloadFromCode(req.body.code);

    if (!payload.email_verified) {
      throw new CustomError.UnauthenticatedError("Email not verified");
    }

    const isAdmin = ADMIN_EMAILS.includes(payload.email);
    const role = isAdmin ? "admin" : "user";

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        role,
      });
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    const tokenUser = {
      name: user.name,
      userId: user._id,
      role: user.role,
    };

    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({
      msg: `${role === "admin" ? "Admin" : "User"} login successful`,
      user: tokenUser,
    });
  } catch (error) {
    console.error("Google login error:", error);
    throw new CustomError.UnauthenticatedError("Google login failed");
  }
};

// 🔒 Admin-only login
const googleLoginAdmin = async (req, res) => {
  try {
    const payload = await getPayloadFromCode(req.body.code);

    if (!payload.email_verified) {
      throw new CustomError.UnauthenticatedError("Email not verified");
    }

    if (!ADMIN_EMAILS.includes(payload.email)) {
      throw new CustomError.UnauthenticatedError("Access denied: Admins only");
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        role: "admin",
      });
    } else if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const tokenUser = {
      name: user.name,
      userId: user._id,
      role: user.role,
    };

    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({
      msg: "Admin login successful",
      user: tokenUser,
    });
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Google login failed");
  }
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).send("User Logged out");
};

module.exports = {
  googleLogin,
  googleLoginAdmin,
  logout,
};
