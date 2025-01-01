const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// HTTP status codes
const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Register a new user with confirm password
const registerUser = async (req, res) => {
  const { name, gmail, password, confirmPassword } = req.body;

  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "Passwords do not match",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ gmail });
    if (existingUser) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "User already exists",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      gmail,
      password: hashedPassword,
    });

    // Generate a token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    newUser.token = token;

    await newUser.save();

    res.status(HTTP_STATUS_CODES.OK).json({
      user: {
        name: newUser.name,
        gmail: newUser.gmail,
        token: newUser.token,
        createdAt: newUser.createdAt,
      },
      message: "User registered successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong",
      error: err.message,
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Forgot password with confirm new password
const forgotPassword = async (req, res) => {
  const { gmail, newPassword, confirmNewPassword } = req.body;

  try {
    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "Passwords do not match",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "User not found",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Password updated successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong",
      error: err.message,
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { gmail, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "User not found",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Invalid credentials",
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    // Generate a new token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(HTTP_STATUS_CODES.OK).json({
      user: {
        name: user.name,
        gmail: user.gmail,
        token: token,
      },
      message: "User logged in successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong",
      error: err.message,
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
