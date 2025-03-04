const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const user = await User.findOne({ username, password });
    console.log(user);
    // if (!user || !bcrypt.compareSync(password, user.password)) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }
    console.log(
      process.env.ACCESS_JWT_EXPIRES_IN,
      process.env.ACCESS_JWT_SECRET
    );
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_JWT_SECRET, {
      expiresIn: process.env.ACCESS_JWT_EXPIRES_IN,
    });
    console.log("Token", token);
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: "Token is valid", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { login, verifyToken };
