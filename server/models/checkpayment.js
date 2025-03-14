const mongoose = require("mongoose");

const checkPaymentSchema = new mongoose.Schema(
  {
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    matchDate: { type: String, required: true },
    matchTime: { type: String, required: true },
    price: { type: Number, required: true },
    teams: [
      {
        teamID: { type: String, required: true },
      },
    ],
  },
  { timestamps: true } // To track createdAt and updatedAt
);

module.exports = mongoose.model("CheckPayment", checkPaymentSchema);
