const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; } // Required only if not a Google user
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true // Allows null values while keeping uniqueness
  },
  name: { 
    type: String, 
    trim: true 
  },
  picture: { 
    type: String 
  },
  status: { 
    type: Boolean, 
    default: false 
  }
});

const User = mongoose.model("IMDFXUSER", userSchema);

module.exports = { User };
