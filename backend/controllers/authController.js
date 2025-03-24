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

// Register a new user
const registerUser = async (req, res) => {
  const { params } = req.body;

  try {
    // Input validation
    if (!params || !params.username || !params.email || !params.password) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "All fields are required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Ensure the email is not null or undefined
    if (!params.email || params.email === null || params.email === undefined) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "Email is required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ email: params.email }, { username: params.username }],
    });
    if (existingUser) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "User already exists",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Generate WebID (count existing users and add 1)
    const userCount = await User.countDocuments();
    const webID = userCount + 1;

    // Hash the password
    const hashedPassword = await bcrypt.hash(params.password, 10);

    // Create a new user
    const newUser = new User({
      username: params.username,
      email: params.email,
      password: hashedPassword,
      webID,
    });

    // Generate a token with webID
    const token = jwt.sign(
      { id: newUser._id, webID: newUser.webID },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    newUser.token = token;
    await newUser.save();

    res.status(HTTP_STATUS_CODES.OK).json({
      user: {
        username: newUser.username,
        token: newUser.token,
        createdAt: newUser.createdAt,
        webID: newUser.webID,
      },
      message: "User registered successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Something went wrong",
      error: err.message,
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { params } = req.body;

  try {
    // Input validation
    if (!params || !params.email || !params.newPassword) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "All fields are required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ email: params.email });
    if (!user) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "User not found",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(params.newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Password updated successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Something went wrong",
      error: err.message,
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Login user with params object
const loginUser = async (req, res) => {
  const { params } = req.body;

  try {
    // Input validation
    if (!params || !params.username || !params.password) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "All fields are required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Check if the user exists by username
    const user = await User.findOne({ username: params.username });
    if (!user) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "User not found",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(params.password, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "Invalid credentials",
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    // Generate a new token with webID
    const token = jwt.sign(
      { id: user._id, webID: user.webID },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(HTTP_STATUS_CODES.OK).json({
      user: {
        username: user.username,
        token: token,
        webID: user.webID,
      },
      message: "User logged in successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Something went wrong",
      error: err.message,
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
