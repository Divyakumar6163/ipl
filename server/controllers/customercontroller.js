const User = require("../models/customer"); // Adjust path as needed

const verifyphone = async (req, res) => {
  try {
    const { phoneNumber, teamID } = req.body;
    console.log(phoneNumber);

    if (!phoneNumber || !teamID) {
      return res
        .status(400)
        .json({ message: "Phone number and team ID are required." });
    }

    // Check if user with given phone number exists
    const user = await User.findOne({ phone: phoneNumber });

    if (user) {
      // Check if teamID already exists in teamsID array
      if (!user.teamsID.includes(teamID)) {
        user.teamsID.push(teamID); // Add teamID to teamsID array
        await user.save(); // Save updated user document
        return res
          .status(200)
          .json({ message: "Customer exists. Team added.", user });
      } else {
        return res
          .status(200)
          .json({ message: "Customer exists. Team already added.", user });
      }
    } else {
      console.log("Customer not found.");
      return res.status(300).json({ message: "Customer not found." });
    }
  } catch (error) {
    console.error("Error checking phone number:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const addcustomer = async (req, res) => {
  try {
    const { phoneNumber, panCard, teamID } = req.body;

    // ✅ Basic Validation
    if (!phoneNumber || !panCard) {
      return res
        .status(400)
        .json({ message: "Phone number and PAN card are required." });
    }

    // ✅ Check if customer already exists
    const existingUser = await User.findOne({ phone: phoneNumber });
    if (existingUser) {
      return res.status(300).json({ message: "Customer already exists." });
    }

    // ✅ Create New Customer
    console.log(teamID);
    const newUser = await User.create({
      phone: phoneNumber,
      panCard: panCard,
      teamsID: Array.isArray(teamID) ? teamID : [teamID], // Ensures always an array
    });

    console.log("New User", newUser);
    return res.status(200).json({
      message: "Customer added successfully.",
      customer: newUser,
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { verifyphone, addcustomer };
