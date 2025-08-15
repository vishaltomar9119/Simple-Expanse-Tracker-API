const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  is_deleted:{
    type: Boolean,
    default:false
  },
  refresh_token:{
    type: String,
    default:null
  }
},{
  timestamps: true  
});
const User = mongoose.model('User', userSchema);


const expenseSchema = new mongoose.Schema({
 user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  
  },
  amount: {
    type: Number,
    default: 0           
  },
  category: {
    type: String,
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
  }
}, {
  timestamps: true  
});
const Expense = mongoose.model('Expense', expenseSchema);


module.exports = {
  User,
  Expense
};
