const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and authenticate the user
const protect = async (req, res, next) => {
  let token;

  // Read token from the Authorization header (Format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the token (excluding their password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ success: false, message: 'No user found with this id' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
  }
};

// Middleware to restrict access to Admins only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin resource only' });
  }
};

module.exports = { protect, adminOnly };