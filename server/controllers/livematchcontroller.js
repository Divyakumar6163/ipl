const Match = require("../models/livematch");

const getScore = async (req, res) => {
  try {
    const { team1, team2, matchDate, players } = req.body;
    const formattedDate = new Date(matchDate).toLocaleDateString("en-GB");
    console.log("Request Body:", req.body);
    console.log("Formatted Date:", formattedDate);
    if (
      !team1 ||
      !team2 ||
      !formattedDate ||
      !players ||
      players.length === 0
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch match from DB that matches team1, team2, and matchDate
    const match =
      (await Match.findOne({ team1, team2, matchDate: formattedDate })) ||
      (await Match.findOne({
        team2: team1.trim(),
        team1: team2.trim(),
        matchDate: formattedDate.trim(),
      }));
    console.log("Match:", match);
    if (!match) {
      return res
        .status(404)
        .json({ message: "No match found for given details" });
    }

    const dbPlayers = Object.fromEntries(match.players);

    console.log("DB Players:", dbPlayers);

    // Retain only the players that exist in both request & database
    const matchedPlayers = players.reduce((acc, player) => {
      if (dbPlayers[player] !== undefined) {
        acc[player] = dbPlayers[player]; // Store player with their score
      }
      return acc;
    }, {});

    console.log("Matched Players:", matchedPlayers);

    res.status(200).json({ players: matchedPlayers });
  } catch (error) {
    console.error("Error fetching matching players:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getScore };
