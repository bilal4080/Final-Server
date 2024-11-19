// authentication.js

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('./config'); // Adjust the path accordingly

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
