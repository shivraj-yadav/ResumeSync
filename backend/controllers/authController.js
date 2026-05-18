const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: generate JWT ────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ── POST /api/auth/signup ───────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Validate required fields
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check username format (alphanumeric + hyphens, no leading/trailing hyphen)
    const usernameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.status(400).json({
        message:
          "Username can only contain lowercase letters, numbers, and hyphens (no leading/trailing hyphens)",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username.toLowerCase(),
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/login ────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/logout ───────────────────────────────
exports.logout = async (req, res) => {
  // JWT is stateless — logout is handled client-side by removing the token
  res.json({ message: "Logged out successfully" });
};

// ── GET /api/auth/check-username ────────────────────────
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const usernameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.json({ available: false, message: "Invalid username format" });
    }

    const exists = await User.findOne({ username: username.toLowerCase() });

    res.json({
      available: !exists,
      message: exists ? "Username is taken" : "Username is available",
    });
  } catch (error) {
    console.error("Check username error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/auth/me ────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
