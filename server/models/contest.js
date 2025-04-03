const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  yesOption: { type: String, default: "YES" },
  yesPoints: { type: Number, required: true },
  noOption: { type: String, default: "NO" },
  noPoints: { type: Number, required: true },
  answer: { type: String, default: "" },
});

const ContestSchema = new mongoose.Schema(
  {
    matchDate: { type: String, required: true }, // Format: "DD-MM-YYYY"
    matchTime: { type: String, required: true }, // Example: "7:30pm"
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    matchCompletion: { type: Boolean, default: false },
    questions: { type: [QuestionSchema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("contest", ContestSchema);
