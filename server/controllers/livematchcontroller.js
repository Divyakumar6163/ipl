const Match = require("../models/livematch");
const Team = require("../models/team");
const Rank = require("../models/rankmodel");
const getScore = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime, players } = req.body;
    // const formattedDate = new Date(matchDate).toLocaleDateString("en-GB");
    const formattedDate = new Date(matchDate)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("-");
    console.log("Request Body:", req.body);
    console.log("Formatted Date:", formattedDate);
    if (
      !team1 ||
      !team2 ||
      !formattedDate ||
      !matchTime ||
      !players ||
      players.length === 0
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch match from DB that matches team1, team2, and matchDate
    const match =
      (await Match.findOne({
        team1,
        team2,
        matchDate: formattedDate,
        matchTime,
      })) ||
      (await Match.findOne({
        team2: team1.trim(),
        team1: team2.trim(),
        matchDate: formattedDate.trim(),
        matchTime: matchTime.trim(),
      }));
    // console.log("Match:", match);
    if (!match) {
      return res
        .status(404)
        .json({ message: "No match found for given details" });
    }

    const dbPlayers = Object.fromEntries(match.players);

    // console.log("DB Players:", dbPlayers);

    // Retain only the players that exist in both request & database
    const matchedPlayers = players.reduce((acc, player) => {
      if (dbPlayers[player] !== undefined) {
        acc[player] = dbPlayers[player]; // Store player with their score
      }
      return acc;
    }, {});

    // console.log("Matched Players:", matchedPlayers);

    res.status(200).json({ players: matchedPlayers });
  } catch (error) {
    console.error("Error fetching matching players:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getPlayer = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime } = req.body;

    if (!team1 || !team2 || !matchDate || !matchTime) {
      return res
        .status(400)
        .json({ message: "Missing required fields: team1, team2, matchDate" });
    }

    // 🔍 Search for match in the database
    const match = await Match.findOne({ team1, team2, matchDate, matchTime });
    console.log(match);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json({ match });
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateScore = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime, players } = req.body;

    if (!team1 || !team2 || !matchDate || !matchTime || !players) {
      return res.status(400).json({
        message: "Missing required fields: team1, team2, matchDate, players",
      });
    }

    // 🔍 Find the match
    const match = await Match.findOne({ team1, team2, matchDate, matchTime });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // 🔄 Update the players' scores in the match
    match.players = players; // Replacing the entire players object with new scores
    await match.save();

    res
      .status(200)
      .json({ message: "Scores updated successfully", updatedMatch: match });
  } catch (error) {
    console.error("Error updating match scores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateRank = async (req, res) => {
  try {
    let { team1, team2, matchDate, matchTime, players } = req.body;

    if (!team1 || !team2 || !matchDate || !matchTime || !players) {
      return res.status(400).json({
        message: "Missing required fields: team1, team2, matchDate, players",
      });
    }

    const dateParts = matchDate.split("-");
    matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

    // 🔍 Find all teams that belong to this match
    const teams = await Team.find({ team1, team2, matchDate, matchTime });

    if (!teams.length) {
      return res.status(404).json({ message: "No teams found for this match" });
    }

    // 🔢 Calculate the net score for each team
    let teamScores = [];
    teams.forEach((team) => {
      let totalScore = 0;

      team.players.forEach((player) => {
        if (players[player] !== undefined) {
          totalScore += players[player]; // Add score if player exists in request
        }
      });

      teamScores.push({ teamId: team._id, score: totalScore });
    });

    // 🔢 Sort teams based on score in descending order
    teamScores.sort((a, b) => b.score - a.score);

    // 🏆 Assign ranks while handling ties correctly
    let rankedTeams = [];
    let currentRank = 1;

    for (let i = 0; i < teamScores.length; i++) {
      if (i > 0 && teamScores[i].score < teamScores[i - 1].score) {
        currentRank++; // Ensure next unique rank follows correctly
      }
      rankedTeams.push({
        teamId: teamScores[i].teamId,
        score: teamScores[i].score,
        rank: currentRank,
      });
    }
    let existingRank = await Rank.findOne({
      team1,
      team2,
      matchDate,
      matchTime,
    });

    if (existingRank) {
      // 🆙 Update existing ranking
      existingRank.rankings = rankedTeams;
      await existingRank.save();
    } else {
      // 📌 Create new ranking entry
      await Rank.create({
        team1,
        team2,
        matchDate,
        matchTime,
        rankings: rankedTeams,
      });
    }
    console.log(rankedTeams);
    res.status(200).json({
      message: "Team scores and rankings updated successfully",
      rankings: rankedTeams,
    });
  } catch (error) {
    console.error("Error calculating team scores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getRank = async (req, res) => {
  try {
    let { team1, team2, matchDate, matchTime } = req.body;

    if (!team1 || !team2 || !matchDate || !matchTime) {
      return res.status(400).json({
        message: "Missing required fields: team1, team2, matchDate",
      });
    }

    // const dateParts = matchDate.split("-");
    // matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

    // 🔍 Find rank entry in the database
    const rankData = await Rank.findOne({ team1, team2, matchDate, matchTime });

    if (!rankData) {
      return res
        .status(404)
        .json({ message: "No ranking data found for this match" });
    }

    res.status(200).json({
      message: "Ranking data retrieved successfully",
      rankings: rankData.rankings,
    });
  } catch (error) {
    console.error("Error fetching ranking data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getScore, getPlayer, updateScore, updateRank, getRank };
