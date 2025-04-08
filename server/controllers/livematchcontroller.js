const Match = require("../models/livematch");
const Team = require("../models/team");
const Rank = require("../models/rankmodel");
const Trackrun = require("../models/trackrun");
const Winners = require("../models/winner");

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
    // console.log("Request Body:", req.body);
    // console.log("Formatted Date:", formattedDate);
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

    res.status(200).json({ players: matchedPlayers, match: match });
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
    // console.log(match);
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
    // console.log("Request Body:", req.body);
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

    // ✅ Group teams by contest price
    const teamsByPrice = {};
    teams.forEach((team) => {
      const price = team.price; // Assuming each team has contestPrice field
      if (!teamsByPrice[price]) teamsByPrice[price] = [];
      teamsByPrice[price].push(team);
    });

    // ⚙️ For storing all ranking results for response
    const allRankings = [];

    // 🔄 Loop through each contest price group
    // console.log("TeamBtPrice", teamsByPrice);
    for (const price in teamsByPrice) {
      const teamsInPriceGroup = teamsByPrice[price];

      // 🔢 Calculate net scores for teams in this price group
      let teamScores = [];
      teamsInPriceGroup.forEach((team) => {
        let totalScore = 0;

        team.players.forEach((player) => {
          if (players[player] !== undefined) {
            totalScore += players[player];
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
          currentRank++; // Increment rank when score is lower
        }
        rankedTeams.push({
          teamId: teamScores[i].teamId,
          score: teamScores[i].score,
          rank: currentRank,
        });
      }

      // ✅ Check if rank for this price group already exists
      let existingRank = await Rank.findOne({
        team1,
        team2,
        matchDate,
        matchTime,
        contestPrice: Number(price), // Ensure price is stored correctly
      });

      if (existingRank) {
        // 🆙 Update existing ranking for this price
        existingRank.rankings = rankedTeams;
        await existingRank.save();
      } else {
        // 📌 Create new ranking for this price
        await Rank.create({
          team1,
          team2,
          matchDate,
          matchTime,
          contestPrice: Number(price), // Store contest price
          rankings: rankedTeams,
        });
      }

      // Collect for final response
      allRankings.push({
        contestPrice: Number(price),
        rankings: rankedTeams,
      });
    }

    // console.log(allRankings);

    res.status(200).json({
      message:
        "Team scores and rankings updated successfully for all contest prices",
      rankings: allRankings,
    });
  } catch (error) {
    console.error("Error calculating team scores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRank = async (req, res) => {
  try {
    let { team1, team2, matchDate, matchTime, contestPrice } = req.body;

    if (!team1 || !team2 || !matchDate || !matchTime || !contestPrice) {
      return res.status(400).json({
        message: "Missing required fields: team1, team2, matchDate",
      });
    }
    console.log("GET Rank Body:", req.body);
    // const dateParts = matchDate.split("-");
    // matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

    // 🔍 Find rank entry in the database
    const rankData = await Rank.findOne({
      team1,
      team2,
      matchDate,
      matchTime,
      contestPrice,
    });
    console.log("RankData", rankData);

    if (!rankData) {
      return res
        .status(400)
        .json({ message: "No ranking data found for this match" });
    }
    // console.log("RankData", rankData);
    res.status(200).json({
      message: "Ranking data retrieved successfully",
      rankings: rankData.rankings,
    });
  } catch (error) {
    console.error("Error fetching ranking data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const trackRun = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime, player, run } = req.body;
    console.log("Request Body:", req.body);
    if (
      !team1 ||
      !team2 ||
      !matchDate ||
      !matchTime ||
      !player ||
      run === undefined
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: team1, team2, matchDate, matchTime, player, run",
      });
    }

    // ✅ Find if match already exists
    let existingMatch = await Trackrun.findOne({
      team1,
      team2,
      matchDate,
      matchTime,
    });

    let milestoneBonus = 0;

    if (existingMatch) {
      // Match exists, check player
      let currentPlayer = existingMatch.players.get(player);

      if (!currentPlayer) {
        // Player not found, initialize
        currentPlayer = {
          score: run,
          fifty: run >= 50,
          hundred: run >= 100,
        };
      } else {
        // Player exists, update score
        currentPlayer.score += run;

        // Check for milestone bonuses
        if (!currentPlayer.fifty && currentPlayer.score >= 50) {
          currentPlayer.fifty = true;
          milestoneBonus = 8; // Bonus for reaching 50
        }
        if (!currentPlayer.hundred && currentPlayer.score >= 100) {
          currentPlayer.hundred = true;
          milestoneBonus = 16; // Bonus for reaching 100 (if applicable later)
        }
      }

      // Update player data in map
      existingMatch.players.set(player, currentPlayer);
      await existingMatch.save();

      return res.status(200).json({
        message: "Player score updated successfully",
        updatedPlayer: currentPlayer,
        run: milestoneBonus,
      });
    } else {
      // ✅ If match doesn't exist, create new match and player
      const players = new Map();
      players.set(player, {
        score: run,
        fifty: run >= 50,
        hundred: run >= 100,
      });

      if (run >= 50) milestoneBonus = 8; // Bonus if already 50+ on first entry

      const newMatch = new Trackrun({
        team1,
        team2,
        matchDate,
        matchTime,
        players,
      });

      await newMatch.save();

      return res.status(201).json({
        message: "Match created and player score added",
        match: newMatch,
        run: milestoneBonus,
      });
    }
  } catch (error) {
    console.error("Error updating/creating match score:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const matchCompletion = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime } = req.body;

    console.log("Request Body:", req.body);
    const dateParts = matchDate.split("-");
    const matchDateModified = new Date(
      `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
    );

    // ✅ Validate required fields
    if (!team1 || !team2 || !matchDate || !matchTime) {
      return res.status(400).json({
        message: "Missing required fields: team1, team2, matchDate, matchTime",
      });
    }

    // ✅ Find teams matching the given match details
    const filter = { team1, team2, matchDate: matchDateModified, matchTime };
    const teams = await Team.find(filter);
    const match = await Match.find({ team1, team2, matchDate, matchTime });
    if (teams.length === 0 || match.length === 0) {
      return res.status(404).json({
        message: "No teams found matching the provided match details.",
      });
    }

    // ✅ Update `matchCompletion` to true for all matched teams
    const updateResult = await Team.updateMany(filter, {
      $set: { matchCompletion: true },
    });
    // console.log("MatchCompletion", match);
    await Match.updateMany(
      { team1, team2, matchDate, matchTime },
      { $set: { matchCompletion: true } }
    );
    console.log(
      `Updated ${updateResult.modifiedCount} team(s) as match completed.`
    );

    return res.status(200).json({
      message: "Match marked as completed for all relevant teams.",
      updatedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating match completion:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPrize = async (req, res) => {
  try {
    const { team1, team2, matchDate, matchTime, rank, teamID, contestPrice } =
      req.body;
    console.log("Request Body:", req.body);
    if (!team1 || !team2 || !matchDate || !matchTime || !rank) {
      return res.status(400).json({
        message:
          "Missing required fields: team1, team2, matchDate, matchTime, rank",
      });
    }
    const dateObj = new Date(matchDate);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    // ✅ Find prize data for specific match and contest
    const winnerData = await Winners.findOne({
      team1,
      team2,
      matchDate: formattedDate,
      matchTime,
      contestPrice,
    });
    // console.log("WinnerData", winnerData);
    if (!winnerData) {
      return res
        .status(404)
        .json({ message: "Prize distribution not found for this match" });
    }

    const prizeDistribution = winnerData.prizeDistribution;

    let prizeAmount = 0;

    // ✅ First check if exact rank prize exists
    if (prizeDistribution[rank]) {
      prizeAmount = prizeDistribution[rank];
    } else {
      // ✅ Check for rank in ranges like "4-10"
      for (const key of Object.keys(prizeDistribution)) {
        if (key.includes("-")) {
          const [start, end] = key.split("-").map(Number);
          if (rank >= start && rank <= end) {
            prizeAmount = prizeDistribution[key];
            break;
          }
        }
      }
    }

    // ✅ Respond with prize
    return res.status(200).json({
      message: "Prize amount fetched successfully",
      prize: prizeAmount,
      rank,
      teamID,
    });
  } catch (error) {
    console.error("Error fetching prize amount:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMatches = async (req, res) => {
  // Get three upcoming matches
  try {
    const today = new Date();
    const matches = await Match.find();

    const filteredMatches = matches.filter((match) => {
      const matchDate = new Date(
        match.matchDate.split("-").reverse().join("-")
      );
      return matchDate > today;
    });

    // console.log("Matches", filteredMatches);
    if (filteredMatches.length === 0) {
      return res.status(404).json({ message: "No upcoming matches found" });
    }

    res.status(200).json({
      data: filteredMatches.slice(0, 3), // Get only the first three matches
    });
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getScore,
  getPlayer,
  updateScore,
  updateRank,
  getRank,
  trackRun,
  matchCompletion,
  getPrize,
  getMatches,
};
