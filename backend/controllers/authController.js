const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user
const registerUser = async (req, res) => {
  const params = req.body;

  try {
    if (!params || !params.username || !params.email || !params.password) {
      return res.status(200).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: params.email }, { username: params.username }],
    });
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "Username or email already exists"
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

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: {
        username: newUser.username,
        token: newUser.token,
        webID: newUser.webID,
      },
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Server error occurred during registration"
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(200).json({
        success: false,
        message: "Please provide username and password"
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { id: user._id, webID: user.webID },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        token: token,
        webID: user.webID,
      },
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Server error occurred during login"
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    if (!username || !newPassword) {
      return res.status(200).json({
        success: false,
        message: "Please provide username and new password"
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Server error occurred while updating password"
    });
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
