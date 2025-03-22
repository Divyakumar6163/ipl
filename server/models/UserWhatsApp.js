const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  from: { type: String, required: true, unique: true }, // User's WhatsApp number
  invoiceId: { type: String }, // Optional initially, required after extraction
  teamName: { type: String }, // Extracted team name
  matchDate: { type: String }, // Extracted match date
  matchTime: { type: String }, // Extracted match time
  waitingForImage: { type: Boolean, default: true }, // Tracks if waiting for image
  createdAt: { type: Date, default: Date.now }, // Automatically stores session creation time
});

module.exports = mongoose.model("UserWhatsApp", userSessionSchema);
