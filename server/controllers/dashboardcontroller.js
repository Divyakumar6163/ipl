const Team = require("../models/team"); // Adjust path as needed
const User = require("../models/usermodel");
const getRetailers = async (req, res) => {
  try {
    // Fetch all users with role "retailer"
    const retailers = await User.find({
      role: { $in: ["retailer", "admin"] },
    });
    console.log("Retailers", retailers);
    if (!retailers.length) {
      return res.status(404).json({ message: "No retailers found." });
    }

    res.status(200).json(retailers);
  } catch (error) {
    console.error("Error fetching retailers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getsoldteam = async (res, req) => {};
const getwinningteam = async (res, req) => {};

module.exports = { getsoldteam, getRetailers, getwinningteam };
