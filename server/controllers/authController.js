const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { data, saveDB, defaultRiskSettings } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'blackrox_super_secret_jwt_key_123!';

// Password verification helper that supports both hashed passwords and plain text defaults
function verifyPassword(inputPassword, storedPassword) {
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
    return bcrypt.compareSync(inputPassword, storedPassword);
  }
  return inputPassword === storedPassword;
}

exports.login = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user && verifyPassword(password, user.password)) {
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account has been suspended.' });
    }

    // Sign a secure JWT token containing the user details
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.lastLogin = new Date().toISOString();
    saveDB();

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lotMultiplier: user.lotMultiplier || 1.0,
        riskSettings: user.riskSettings || defaultRiskSettings
      }
    });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
};
