const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema({
  question: String,
  options: [{ text: String, votes: { type: Number, default: 0 } }],
  votedIPs: [String], // Mechanism 1: IP tracking
});

module.exports = mongoose.model("Poll", PollSchema);
