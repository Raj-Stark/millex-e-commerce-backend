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

const ADMIN_EMAILS = ["vishalpj1144@gmail.com"];

const googleLogin = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new CustomError.BadRequestError("Authorization code is missing");
  }

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    // Verify the token and extract payload
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      throw new CustomError.UnauthenticatedError("Email not verified");
    }

    const role = ADMIN_EMAILS.includes(payload.email) ? "admin" : "user";

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        role,
      });
    }

    const tokenUser = {
      name: user.name,
      userId: user._id,
      role: user.role,
    };

    attachCookiesToResponse({ res, user: tokenUser });

    res
      .status(StatusCodes.OK)
      .json({ msg: "Google login successful", user: tokenUser });
  } catch (error) {
    console.error("Google login error:", error);
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
  logout,
};
