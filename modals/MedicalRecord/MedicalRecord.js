// Create a Mongoose Schema
const mongoose = require('mongoose')
const Medical = new mongoose.Schema({

  userId: { type: String, required: false },
  bmi: { type: String, required: false },
  hr: { type: String, required: false },
  Weight: { type: String, required: false },
  Fbc: { type: String, required: false },
  dob: { type: String, required: false },

});

const MedicalRecords = mongoose.model("MedicalRecord", Medical);
module.exports = { MedicalRecords };

