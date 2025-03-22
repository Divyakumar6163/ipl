const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  from: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: "24h" }, // Auto-expire in 24h
});

module.exports = mongoose.model("UserWhatsApp", userSessionSchema);
