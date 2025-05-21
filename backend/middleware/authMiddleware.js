const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 👇 This must match what you include in jwt.sign() during login
      req.user = decoded;

      console.log("req.user:", req.user); // ✅ Useful debug log
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.warn("No Authorization header found");
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = { protect };
