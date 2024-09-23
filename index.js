const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var config = require("./config");
const locationRoutes = require("./src/routes/locationRoutes");

dotenv.config();

const app = express();
app.use(express.json());
const port = config.PORT || 3000;

// Kết nối MongoDB
mongoose
  .connect(config.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.use("/api", locationRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
