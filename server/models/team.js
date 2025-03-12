const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    matchDate: { type: Date, required: true },
    matchTime: { type: String, required: true },
    price: { type: Number, required: true },
    matchCompletion: { type: Boolean, default: false },
    players: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const Match = mongoose.model("Teams", matchSchema);

module.exports = Match;
