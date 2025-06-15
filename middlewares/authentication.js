const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }

  try {
    const { name, userId, role } = isTokenValid({ token });

    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (roles.length && !roles.includes(role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }

    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
