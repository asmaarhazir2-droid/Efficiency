const jwt = require('jsonwebtoken');
const { get } = require('./db');

const secret = process.env.JWT_SECRET || 'change-me';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
}

function authorize(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  secret
};
