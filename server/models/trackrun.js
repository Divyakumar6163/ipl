const mongoose = require("mongoose");

// Schema for storing player scores with 50 & 100 flags
const matchScoreSchema = new mongoose.Schema(
  {
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    matchDate: { type: String, required: true }, // DD-MM-YYYY
    matchTime: { type: String, required: true }, // "7:30pm" or "3:30pm"
    players: {
      type: Map,
      of: new mongoose.Schema({
        score: { type: Number, default: 0 },
        fifty: { type: Boolean, default: false },
        hundred: { type: Boolean, default: false },
      }),
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trackrun", matchScoreSchema);
