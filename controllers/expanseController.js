const {Expense} = require('../models/model');
const expanseController = {};

const addExpense = async (req, res) => {
  try {
   const expense = new Expense({
      ...req.body,
      user: req.user._id
    });

    const data = await expense.save();
    if(data._id){
      res.status(201).json(expense);
    }else{
      res.status(200).json({message:'Not saved'});
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: 'Invalid expense data' });
  }
};

const getExpenses = async (req, res) => {
  try{
  const { startDate, endDate, category, sortBy = 'date', order = 'desc', page = 1, limit = 10 } = req.query;
  let query = { user: req.user._id };
  
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (category) {
    query.category = category;
  }
  let skip = (parseInt(page) - 1) * parseInt(limit);
  const expenses = await Expense.find(query).sort({ [sortBy]: order === 'desc' ? -1 : 1 }).skip(skip).limit(parseInt(limit));
  
  res.json(expenses);

  }catch(err){
   console.log(err)
   res.send(err)
  }
};

const editExpense = async (req, res) => {
  try{
    const { id } = req.params;
    const updated = await Expense.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Expense not found' });
    }else{
      res.json(updated);
    }
  }catch(err){
    console.log(err)
    res.send(err)
  }
};

const deleteExpense = async (req, res) => {
   try{
     const { id } = req.params;
     const deleted = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
     if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
     }else{
       res.json({ message: 'Deleted' });
     }
  }catch(err){
    console.log(err)
    res.send(err)
  }
};

const monthlySummary = async (req, res) => {
   try{
     const summary = await Expense.aggregate([
       { $match: { user: req.user._id } },
       {
         $group: {
           _id: {
             month: { $month: "$date" },
             year: { $year: "$date" },
             category: "$category"
           },
           total: { $sum: "$amount" }
         }
       },
       {
         $project: {
           month: "$_id.month",
           year: "$_id.year",
           category: "$_id.category",
           total: 1,
           _id: 0
         }
       },
       { $sort: { year: -1, month: -1 } }
     ]);
     res.json(summary);
  }catch(err){
    console.log(err)
    res.send(err)
  }
};

expanseController.addExpense = addExpense;
expanseController.getExpenses = getExpenses;
expanseController.deleteExpense = deleteExpense;
expanseController.editExpense = editExpense;
expanseController.monthlySummary = monthlySummary;

module.exports = expanseController;