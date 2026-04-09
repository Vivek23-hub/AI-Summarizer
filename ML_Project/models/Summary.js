const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  originalText: String,
  summaryText: String
}, { timestamps: true });

module.exports = mongoose.model("Summary", summarySchema);