const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Summary = require("../models/Summary");

// insert user
router.get("/add-user", async (req, res) => {
  const user = new User({
    name: "Amit",
    email: "amit@gmail.com",
    password: "123"
  });

  await user.save();
  res.send("User saved");
});

// insert summary
router.get("/add-summary", async (req, res) => {
  const user = await User.findOne();

  const summary = new Summary({
    userId: user._id,
    originalText: "Machine learning is a field of AI...",
    summaryText: "ML is part of AI"
  });

  await summary.save();
  res.send("Summary saved");
});

module.exports = router;