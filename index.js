// index.js
require('dotenv').config();
const express = require("express");
const { handleMongooseConnection } = require("./connection");
const urlRouter = require("./routes/users");
const Url = require("./model/url");
const path = require('path');
const { staticrouter } = require("./routes/staticRouter");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ShortUrl2";
handleMongooseConnection(MONGODB_URI);

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', staticrouter);
app.use('/auth', authRoutes);
app.use("/url", urlRouter);

// URL redirection handler
app.get("/:shortUrl", async (req, res) => {
  try {
    const shortUrl = req.params.shortUrl;
    const entry = await Url.findOneAndUpdate(
      { shortUrl },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
            // Optional: Add more visitor data
            // ip: req.ip,
            // referrer: req.get('referer') || 'Direct',
            // userAgent: req.get('user-agent')
          },
        },
      }
    );

    if (!entry) {
      return res.status(404).render('error', { error: "URL not found" });
    }
    
    res.redirect(entry.redirectUrl);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    res.status(500).render('error', { error: "Server error" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { error: "Page not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});