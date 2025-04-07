// model/url.js
const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    visitHistory: [
      {
        timestamp: { type: Number },
        // Optional: Track additional visitor info
        // ip: { type: String },
        // referrer: { type: String },
        // userAgent: { type: String }
      },
    ],
  },
  { timestamps: true }
);

// Add an index for faster lookups
urlSchema.index({ shortUrl: 1 });

const urlModel = mongoose.model("url", urlSchema);

module.exports = urlModel;