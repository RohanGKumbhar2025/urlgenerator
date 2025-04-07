const mongoose = require("mongoose");

async function handleMongooseConnection(url) {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return false;
  }
}

module.exports = { handleMongooseConnection };