const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  apkUrl: { type: String, required: true },
  mandatory: { type: Boolean, default: false },
});

module.exports = mongoose.model("AppVersion", appVersionSchema);
