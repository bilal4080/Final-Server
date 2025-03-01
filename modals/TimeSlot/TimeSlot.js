const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  type: { type: String, enum: ["Daily", "Weekly"], required: true },
  date: { type: String },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  selectedDays: { type: [String] },
  startDate: { type: String },
  endDate: { type: String },
});

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

module.exports = TimeSlot; // ✅ Correct way to export the model
