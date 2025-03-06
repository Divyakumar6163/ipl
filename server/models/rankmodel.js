const mongoose = require("mongoose");

const RankSchema = new mongoose.Schema(
  {
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    matchDate: { type: Date, required: true },
    rankings: [
      {
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        score: { type: Number, required: true },
        rank: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rank", RankSchema);
