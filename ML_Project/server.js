require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

// middleware
app.use(express.json());

// routes
app.use("/api", require("./routes/test"));

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);