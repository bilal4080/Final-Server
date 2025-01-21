const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  status: { 
    type: Boolean, 
    default: false 
  },
});

const User = mongoose.model('IMDFXUSER', userSchema);

module.exports = { User };
