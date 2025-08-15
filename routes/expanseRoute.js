const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controllers/expanseController');

router.use(auth);

router.post('/', expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.put('/:id',expenseController.editExpense);
router.delete('/:id', expenseController.deleteExpense);


module.exports = router;
