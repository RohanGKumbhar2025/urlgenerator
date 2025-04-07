// router/staticRouter.js
const express = require("express");
const { handleHomepage, handleGetUserUrls } = require('../controller/url');
const authMiddleware = require('../middleware/authMiddleware');

const staticrouter = express.Router();

staticrouter.get("/", authMiddleware, handleHomepage);
staticrouter.get("/dashboard", authMiddleware, handleGetUserUrls);

module.exports = { staticrouter };