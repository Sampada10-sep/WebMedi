const express = require("express");
const jwt = require("jsonwebtoken");

const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();

const authenticateToken = (req, res, next) => {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    const parts = authorizationHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        message: "Invalid authentication token format",
      });
    }

    const token = parts[1];

    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decodedUser;

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Your session has expired. Please log in again."
          : "Invalid authentication token",
    });
  }
};

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post(
  "/change-password",
  authenticateToken,
  changePassword
);

module.exports = router;