const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail } = require('../db');
const { secret } = require('../middleware');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: '8h'
  });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

module.exports = router;
