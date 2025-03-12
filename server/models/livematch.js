const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  matchDate: { type: String, required: true },
  matchTime: { type: String, required: true },
  matchCompletion: { type: Boolean, default: false },
  players: {
    type: Map,
    of: Number,
    required: true,
  },
});

module.exports = mongoose.model("LiveMatch", matchSchema);
