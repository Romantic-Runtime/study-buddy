const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  // Check for token in cookie first, then in Authorization header
  let token = req.cookies.token;
  
  // If no cookie token, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }
  
  console.log("Auth middleware - Token received:", token ? "Yes" : "No");
  console.log("Auth middleware - Source:", req.cookies.token ? "Cookie" : "Header");
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Token missing. Please login." 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    console.log("Auth middleware - Decoded token:", decoded.email || decoded.userId);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware - Token verification error:", error.message);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token." 
    });
  } 
}

module.exports = auth;