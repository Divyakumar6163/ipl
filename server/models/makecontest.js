const mongoose = require("mongoose");

const contestSubmissionSchema = new mongoose.Schema({
  contest_id: { type: String, required: true },
  matchDate: { type: String, required: true },
  matchTime: { type: String, required: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  selectedQuestions: [
    {
      text: { type: String, required: true },
      response: { type: String, enum: ["yes", "no"], required: true },
      points: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("usercontests", contestSubmissionSchema);
