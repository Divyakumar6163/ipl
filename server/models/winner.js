const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  matchDate: { type: String, required: true },
  matchTime: { type: String, required: true },
  contestPrice: { type: Number, required: true },
  prizeDistribution: { type: mongoose.Schema.Types.Mixed, required: true },
});

module.exports = mongoose.model("Winner", winnerSchema);
