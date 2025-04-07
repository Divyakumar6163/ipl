const CheckPayment = require("../models/checkpayment"); // Adjust the path based on your structure
const User = require("../models/usermodel"); // Adjust the path based on your structure

const checkpayment = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime, price, teamID } = req.body;
    console.log("Payemnt Verification", req.body);
    if (!team1 || !team2 || !matchDate || !matchTime || !price || !teamID) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Check if match entry exists
    let existingMatch = await CheckPayment.findOne({
      team1,
      team2,
      matchDate,
      matchTime,
      price,
    });

    if (existingMatch) {
      // ✅ Match found, now check if teamID is already added
      const isTeamPresent = existingMatch.teams.some(
        (team) => team.teamID === teamID
      );

      if (isTeamPresent) {
        return res.status(200).json({
          message: "✅ Team ID already recorded. Payment exists.",
          status: "already-paid",
        });
      } else {
        return res.status(201).json({
          message: "✅ Team ID not recorded. Payment does not exist.",
          status: "not-paid",
        });
      }
    } else {
      console.log("Checking for team ID");
      return res.status(201).json({
        message: "✅ Team ID not recorded. Payment does not exist.",
        status: "not-paid",
      });
    }
  } catch (error) {
    console.error("Error checking/adding payment:", error);
    return res.status(500).json({
      message: "⚠️ Internal Server Error. Please try again.",
      error: error.message,
    });
  }
};
const verifypayment = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime, price, teamID } = req.body;
    console.log("Payemnt body", req.body);
    if (!team1 || !team2 || !matchDate || !matchTime || !price || !teamID) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Check if match entry exists
    let existingMatch = await CheckPayment.findOne({
      team1,
      team2,
      matchDate,
      matchTime,
      price,
    });

    if (existingMatch) {
      // ✅ Match found, now check if teamID is already added
      const isTeamPresent = existingMatch.teams.some(
        (team) => team.teamID === teamID
      );

      if (isTeamPresent) {
        return res.status(200).json({
          message: "✅ Team ID already recorded. Payment exists.",
          status: "already-paid",
        });
      }

      // ✅ TeamID not present, add it
      existingMatch.teams.push({ teamID });
      await existingMatch.save();

      return res.status(200).json({
        message: "✅ Team ID added successfully for the existing match.",
        status: "added",
      });
    } else {
      // ❌ Match not found, create a new entry and add teamID
      const newPayment = new CheckPayment({
        team1,
        team2,
        matchDate,
        matchTime,
        price,
        teams: [{ teamID }],
      });

      await newPayment.save();

      return res.status(201).json({
        message: "✅ Match created and Team ID added successfully.",
        status: "new-entry",
      });
    }
  } catch (error) {
    console.error("Error checking/adding payment:", error);
    return res.status(500).json({
      message: "⚠️ Internal Server Error. Please try again.",
      error: error.message,
    });
  }
};

const addpaymentdetail = async (req, res) => {
  try {
    const { teamID, retailerID, winningAmount } = req.body;

    // ✅ Check for required fields
    if (!teamID || !retailerID || winningAmount === undefined) {
      return res.status(400).json({
        message: "Missing required fields: teamID, retailerID, winningAmount",
      });
    }

    // ✅ Search for retailer in User collection
    const retailer = await User.findOne({
      _id: retailerID,
      role: { $in: ["retailer", "admin"] },
    });

    if (!retailer) {
      return res.status(400).json({ message: "Invalid retailer ID." });
    }

    // ✅ Add payment detail to retailer's record
    retailer.payments = retailer.payments || []; // Initialize if not present
    retailer.payments.push({
      teamID: teamID,
      winningAmount: winningAmount,
    });

    await retailer.save();

    return res.status(200).json({
      message: "✅ Payment detail added successfully.",
      payment: { teamID, winningAmount },
    });
  } catch (error) {
    console.error("Error adding payment detail:", error);
    return res.status(500).json({
      message: "⚠️ Internal Server Error. Please try again.",
      error: error.message,
    });
  }
};

module.exports = { verifypayment, addpaymentdetail, checkpayment };
