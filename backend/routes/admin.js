const express = require('express');
const { authenticate } = require('../middleware');
const {
  getDropdownsByUser,
  addDropdownOption,
  getDropdownOptionById,
  updateDropdownOption,
  deleteDropdownOption,
  getStatistics,
  getAllDropdownsWithUser
} = require('../db');

const router = express.Router();
router.use(authenticate);

router.get('/dropdowns', async (req, res) => {
  if (req.user.role === 'superadmin') {
    const rows = await getAllDropdownsWithUser();
    return res.json({ dropdowns: rows });
  }
  const rows = await getDropdownsByUser(req.user.id);
  res.json({ dropdowns: rows });
});

router.post('/dropdowns', async (req, res) => {
  const { label, value, category } = req.body;
  if (req.user.role === 'superadmin') {
    return res.status(403).json({ error: 'Super Admin ne peut pas modifier les listes' });
  }
  if (!label || !value || !category) {
    return res.status(400).json({ error: 'Données manquantes' });
  }
  await addDropdownOption(req.user.id, { label, value, category });
  res.json({ success: true });
});

router.put('/dropdowns/:id', async (req, res) => {
  const { id } = req.params;
  const { label, value, category } = req.body;
  const option = await getDropdownOptionById(id);
  if (!option || option.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Option introuvable' });
  }
  await updateDropdownOption(id, {
    label: label || option.label,
    value: value || option.value,
    category: category || option.category
  });
  res.json({ success: true });
});

router.delete('/dropdowns/:id', async (req, res) => {
  const { id } = req.params;
  const option = await getDropdownOptionById(id);
  if (!option || option.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Option introuvable' });
  }
  await deleteDropdownOption(id);
  res.json({ success: true });
});

router.get('/statistics', async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès réservé au Super Admin' });
  }
  const stats = await getStatistics();
  res.json(stats);
});

module.exports = router;
