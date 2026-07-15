const jwt = require('jsonwebtoken');
const { data } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'blackrox_super_secret_jwt_key_123!';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  // Support mock token prefix for offline fallback mode compatibility
  if (token.startsWith('blackrox_jwt_mock_token_')) {
    const userEmail = token.replace('blackrox_jwt_mock_token_', '');
    const user = data.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'Access denied. Invalid account status.' });
    }
    req.user = user;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = data.users.find(u => u.id === decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'Access denied. Invalid account status.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Access denied. Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
