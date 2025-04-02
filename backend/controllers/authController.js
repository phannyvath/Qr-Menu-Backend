const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    if (!params || !params.username || !params.email || !params.password) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "All fields are required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    if (!params.email) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "Email is required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: params.email }, { username: params.username }],
    });
    if (existingUser) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "User already exists",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const userCount = await User.countDocuments();
    const webID = userCount + 1;
    const hashedPassword = await bcrypt.hash(params.password, 10);

    const newUser = new User({
      username: params.username,
      email: params.email,
      password: hashedPassword,
      webID,
    });

    const token = jwt.sign(
      { id: newUser._id, webID: newUser.webID },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    newUser.token = token;
    await newUser.save();

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: "User registered successfully",
      statusCode: HTTP_STATUS_CODES.OK,
      user: {
        username: newUser.username,
        token: newUser.token,
        webID: newUser.webID,
      },
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.OK).json({
      success: false,
      message: "Registration failed",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "Username and password are required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "User not found",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "Invalid credentials",
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    const token = jwt.sign(
      { id: user._id, webID: user.webID },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: "Login successful",
      statusCode: HTTP_STATUS_CODES.OK,
      user: {
        username: user.username,
        token: token,
        webID: user.webID,
      },
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.OK).json({
      success: false,
      message: "Login failed",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    if (!username || !newPassword) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "Username and new password are required",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: false,
        message: "User not found",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: "Password updated successfully",
      statusCode: HTTP_STATUS_CODES.OK,
    });
  } catch (err) {
    res.status(HTTP_STATUS_CODES.OK).json({
      success: false,
      message: "Password update failed",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
