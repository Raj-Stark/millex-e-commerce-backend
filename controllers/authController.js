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

// ✅ PUBLIC Google login for main site
const googleLogin = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new CustomError.BadRequestError("Authorization code is missing");
  }

  try {
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      throw new CustomError.UnauthenticatedError("Email not verified");
    }

    // Allow any verified user
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        role: "user",
      });
    }

    const tokenUser = {
      name: user.name,
      userId: user._id,
      role: user.role,
    };

    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({
      msg: "Google login successful",
      user: tokenUser,
    });
  } catch (error) {
    console.error("Google login error:", error);
    throw new CustomError.UnauthenticatedError("Google login failed");
  }
};

// ✅ Admin-only login for dashboard
const googleLoginAdmin = async (req, res) => {
  const { code } = req.body;

  console.log("🟡 Received login request with code:", code);

  if (!code) {
    console.error("❌ No authorization code provided");
    throw new CustomError.BadRequestError("Authorization code is missing");
  }

  try {
    // Step 1: Exchange code for tokens
    const { tokens } = await client.getToken(code);
    console.log("🟢 Google tokens received:", tokens);

    const idToken = tokens.id_token;
    if (!idToken) {
      console.error("❌ No id_token found in tokens");
      throw new CustomError.UnauthenticatedError("Invalid Google token");
    }

    // Step 2: Verify ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("🔵 Google payload decoded:", payload);

    // Step 3: Verify email
    if (!payload.email_verified) {
      console.error("❌ Email not verified:", payload.email);
      throw new CustomError.UnauthenticatedError("Email not verified");
    }

    // Step 4: Check admin access
    if (!ADMIN_EMAILS.includes(payload.email)) {
      console.error("⛔ Unauthorized admin email attempt:", payload.email);
      throw new CustomError.UnauthenticatedError("Access denied: Admins only");
    }

    // Step 5: Check if user exists or create new
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        role: "admin",
      });
      console.log("🆕 Admin user created:", user.email);
    } else {
      console.log("✅ Admin user found:", user.email);
    }

    // Step 6: Send token
    const tokenUser = {
      name: user.name,
      userId: user._id,
      role: user.role,
    };

    attachCookiesToResponse({ res, user: tokenUser });
    console.log("🔐 Token attached for:", tokenUser);

    res.status(StatusCodes.OK).json({
      msg: "Admin login successful",
      user: tokenUser,
    });
  } catch (error) {
    console.error("❌ Admin Google login error:", error);
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
