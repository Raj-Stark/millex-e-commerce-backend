const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return token;
};

const isTokenValid = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// const attachCookiesToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });
//   const oneDay = 1000 * 60 * 60 * 24;

//   const isProduction = process.env.NODE_ENV === "production";

//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: isProduction, // only true if behind HTTPS
//     signed: true,
//     sameSite: isProduction ? "Strict" : "Lax", // allow cookie in dev
//     path: "/",
//   });
// };

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: isProduction ? true : false, // ❗ allow over HTTP during dev
    signed: true,
    sameSite: isProduction ? "None" : "Lax", // ❗ 'None' required for cross-origin with HTTPS, 'Lax' works for dev
    path: "/",
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
