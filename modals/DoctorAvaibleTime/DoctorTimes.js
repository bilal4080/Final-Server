const mongoose = require('mongoose');

// Define the schema for available timings
const availableTimingsSchema = new mongoose.Schema({
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  sessions: [{
    date: {
      type: Date,
      required: false
    },
    startTime: {
      type: String,
      required: false
    },
    endTime: {
      type: String,
      required: false
    }
  }]
});

// Create a Mongoose model based on the schema
const AvailableTimings = mongoose.model('DoctorAvailableTimings', availableTimingsSchema);

module.exports = {AvailableTimings};
