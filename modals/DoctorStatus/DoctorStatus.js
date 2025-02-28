const mongoose = require("mongoose");

const DoctorStatusSchema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "doctordetails", // Reference to doctor details model
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
  last_page: {
    type: String,
    default: "Unknown",
  },
});

module.exports = mongoose.model("DoctorStatus", DoctorStatusSchema);
