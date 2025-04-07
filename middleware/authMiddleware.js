// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Assuming you're using cookies for authentication
  
  if (!token) {
    console.log('No authentication token found');
    return res.redirect('/auth/login'); // Redirect to login page if no token is found
  }

  try {
    // Use the same JWT_SECRET from environment variables that was used to sign the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach user ID to the request object
    next();
  } catch (error) {
    console.log('Invalid authentication token:', error.message);
    res.clearCookie('token'); // Clear the invalid token
    res.redirect('/auth/login'); // Redirect to login page if token is invalid
  }
};

module.exports = authMiddleware; // Export the middleware