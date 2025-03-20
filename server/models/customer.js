const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    panCard: { type: String, required: true },
    teamsID: [{ type: String }],
  },
  { timestamps: true } // To track createdAt and updatedAt
);

module.exports = mongoose.model("Customer", customerSchema);
