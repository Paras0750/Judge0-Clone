const jwt = require("jsonwebtoken");

// Verify JWT token middleware

function verifyToken(req, res, next) {
  //Checks X-Auth-Token for a valid token
  const token = req.headers["x-auth-token"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
