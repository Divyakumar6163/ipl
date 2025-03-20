const Team = require("../models/team"); // Adjust path as needed
const User = require("../models/usermodel");

const getRetailers = async (req, res) => {
  try {
    // Fetch all users with role "retailer" or "admin"
    const retailers = await User.find({
      role: { $in: ["retailer", "admin"] },
    });

    if (!retailers.length) {
      return res.status(404).json({ message: "No retailers found." });
    }

    // Fetch all teamsSold IDs from retailers
    const allTeamIDs = retailers.flatMap((retailer) => retailer.teamsold || []);
    console.log("All Sold Team IDs:", allTeamIDs);

    // Fetch details of teamsSold from Team collection
    const soldTeams = await Team.find({
      _id: { $in: allTeamIDs },
    }).select("_id price");

    console.log("Filtered Teams:", soldTeams);

    // Create a map of teamID -> price
    const teamPriceMap = new Map();
    soldTeams.forEach((team) => {
      teamPriceMap.set(team._id.toString(), team.price);
    });

    // Format retailer data to match frontend expectations
    const filteredRetailers = retailers.map((retailer) => {
      const filteredTeams = (retailer.teamsold || [])
        .filter((teamID) => teamPriceMap.has(teamID.toString()))
        .map((teamID) => ({
          teamID,
          price: teamPriceMap.get(teamID.toString()),
        }));

      return {
        _id: retailer._id,
        username: retailer.username,
        teamsSold: filteredTeams, // Now matches frontend { teamID, price }
        totalWinningTickets: retailer.payments ? retailer.payments.length : 0,
        totalWinningPaid: retailer.payments
          ? retailer.payments.reduce(
              (sum, payment) => sum + (payment.winningAmount || 0),
              0
            )
          : 0,
        winningTeams: retailer.payments
          ? retailer.payments.map((p) => p.teamID || "")
          : [],
      };
    });

    console.log("Final Processed Retailers:", filteredRetailers);
    res.status(200).json(filteredRetailers);
  } catch (error) {
    console.error("Error fetching retailers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getsoldteam = async (req, res) => {
  try {
    const { fromDate, toDate, retailers } = req.body;

    if (!fromDate || !toDate || !Array.isArray(retailers)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    console.log(`Filtering teams created between: ${from} - ${to}`);

    // Fetch all teamIDs from retailers' teamsSold
    const allTeamIDs = retailers.flatMap((retailer) =>
      (retailer.teamsSold || []).map((team) => team.teamID)
    );
    console.log("All Sold Team IDs:", allTeamIDs);

    if (allTeamIDs.length === 0) {
      return res
        .status(200)
        .json(retailers.map((retailer) => ({ ...retailer, teamsSold: [] })));
    }

    // Fetch teams from Team collection that were created within the date range
    const soldTeams = await Team.find({
      _id: { $in: allTeamIDs },
      createdAt: { $gte: from, $lte: to },
    }).select("_id price");

    console.log("Filtered Teams Based on Date:", soldTeams);

    // Create a map of teamID -> price
    const teamPriceMap = new Map();
    soldTeams.forEach((team) => {
      teamPriceMap.set(team._id.toString(), team.price);
    });

    // Filter teamsSold for each retailer & attach prices
    const filteredRetailers = retailers.map((retailer) => {
      const filteredTeams = (retailer.teamsSold || [])
        .map((team) => ({
          teamID: team.teamID,
          price: teamPriceMap.get(team.teamID) || null,
        }))
        .filter((team) => team.price !== null); // Remove teams not in date range

      return { ...retailer, teamsSold: filteredTeams };
    });

    console.log("Filtered Retailers:", filteredRetailers);
    res.status(200).json(filteredRetailers);
  } catch (error) {
    console.error("Error filtering sold teams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getwinningteam = async (res, req) => {};

module.exports = { getsoldteam, getRetailers, getwinningteam };
