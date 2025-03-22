const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  from: { type: String, required: true, unique: true },
  invoiceId: { type: String, required: true },
  teamName: { type: String, required: true },
  matchDate: { type: String, required: true },
  matchTime: { type: String, required: true },
});

module.exports = mongoose.model("UserWhatsApp", userSessionSchema);
