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
    res.status(200).json({ token, role: user.role, data: user });
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
const updatesold = async (req, res) => {
  try {
    const { retailerID, teamID } = req.body;
    console.log("IDs", retailerID, teamID);
    // Check if both retailerID and teamID are provided
    if (!retailerID || !teamID) {
      return res
        .status(400)
        .json({ message: "Both retailerID and teamID are required" });
    }

    // Find the retailer in the database
    const user = await User.findOne({ _id: retailerID });

    if (!user) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    // Update the teamsold array by adding the new teamID
    await User.updateOne(
      { _id: retailerID },
      { $push: { teamsold: teamID } } // Adds teamID to the array
    );

    res.status(200).json({ message: "Team sold updated successfully" });
  } catch (error) {
    console.error("Error updating teamsold:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { login, verifyToken, updatesold };
