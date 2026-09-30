const express = require('express');
const { authenticate } = require('../middleware');
const { getDropdownsByUser, getDropdownOptionById, addEntry } = require('../db');

const router = express.Router();
router.use(authenticate);

router.get('/dropdowns', async (req, res) => {
  const rows = await getDropdownsByUser(req.user.id);
  res.json(rows);
});

router.post('/entry', async (req, res) => {
  const { dropdown_id, selected_value, category } = req.body;
  if (!dropdown_id || !selected_value) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const option = await getDropdownOptionById(dropdown_id);
  if (!option || option.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Option non autorisée' });
  }

  await addEntry({
    user_id: req.user.id,
    dropdown_id,
    selected_value,
    category: category || option.category,
    created_at: new Date().toISOString()
  });
  res.json({ success: true });
});

module.exports = router;
