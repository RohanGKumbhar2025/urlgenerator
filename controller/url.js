// controller/url.js
const { nanoid } = require('nanoid');
const Url = require("../model/url");

async function handleGenerateNewShortUrl(req, res) {
  try {
    const { url: redirectUrl } = req.body;
    
    if (!redirectUrl) {
      return res.status(400).render('home', { error: "URL is required" });
    }
    
    // Validate URL format
    try {
      new URL(redirectUrl);
    } catch (err) {
      return res.status(400).render('home', { error: "Invalid URL format" });
    }
    
    const shortid = nanoid(8); // Generate a short ID
    
    // Associate URL with current user
    const newUrl = await Url.create({
      shortUrl: shortid,
      redirectUrl,
      createdBy: req.userId, // From auth middleware
      visitHistory: [],
    });

    // Render the page with the new URL info
    return res.render('home', {
      id: shortid,
      originalUrl: redirectUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortid}`,
      visitHistory: [],
      success: "URL shortened successfully!"
    });
  } catch (error) {
    console.error('Error generating short URL:', error);
    return res.status(500).render('home', { error: "Server error, please try again" });
  }
}

async function handleAnalytics(req, res) {
  try {
    const { shortUrl } = req.params;
    
    const result = await Url.findOne({ shortUrl });
    
    if (!result) {
      return res.status(404).json({ error: "URL not found" });
    }
    
    // Check if user owns this URL or is an admin
    if (result.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "You don't have permission to view these analytics" });
    }
    
    return res.json({ 
      totalClicks: result.visitHistory.length, 
      analytics: result.visitHistory 
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function handleGetUserUrls(req, res) {
  try {
    // Find all URLs created by current user
    const urls = await Url.find({ createdBy: req.userId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .select('shortUrl redirectUrl createdAt visitHistory');
    
    // Prepare data for dashboard view
    const urlData = urls.map(url => ({
      shortUrl: url.shortUrl,
      redirectUrl: url.redirectUrl,
      fullShortUrl: `${req.protocol}://${req.get('host')}/${url.shortUrl}`,
      createdAt: url.createdAt,
      clicks: url.visitHistory.length
    }));
    
    res.render('dashboard', { urls: urlData });
  } catch (error) {
    console.error('Error fetching user URLs:', error);
    res.status(500).render('dashboard', { error: "Failed to load your URLs" });
  }
}

async function handleVisitHistory(req, res) {
  try {
    const { shortUrl } = req.params;
    
    const result = await Url.findOne({ shortUrl });
    
    if (!result) {
      return res.status(404).render('error', { error: "URL not found" });
    }
    
    // Check if user owns this URL
    if (result.createdBy.toString() !== req.userId) {
      return res.status(403).render('error', { error: "You don't have permission to view this history" });
    }
    
    return res.render('history', {
      shortUrl,
      redirectUrl: result.redirectUrl,
      visitHistory: result.visitHistory
    });
  } catch (error) {
    console.error('Error fetching visit history:', error);
    return res.status(500).render('error', { error: "Server error" });
  }
}

async function handleHomepage(req, res) {
  res.render('home');
}

module.exports = { 
  handleGenerateNewShortUrl, 
  handleAnalytics, 
  handleHomepage, 
  handleVisitHistory,
  handleGetUserUrls
};