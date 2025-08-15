const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controllers/expanseController');

router.use(auth);

router.get('/monthly', expenseController.monthlySummary);

module.exports = router;