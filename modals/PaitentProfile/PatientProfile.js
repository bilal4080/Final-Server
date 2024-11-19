// Import necessary modules
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({

  image: { type: String, required: false },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  dateOfBirth: { type: String },
  email: { type: String, required: false, unique: true },
  mobile: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  userId: { type: String },
  // Add more fields as needed
});

// Create the User model
const PatientProfile = mongoose.model('PatientProfile', userSchema);

// Export the User model
module.exports = {PatientProfile};
