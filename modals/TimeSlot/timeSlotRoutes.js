const express = require("express");
const router = express.Router();
const TimeSlot = require("../TimeSlot/TimeSlot");

// ✅ Add a new time slot
router.post("/add-slot", async (req, res) => {
  try {
    const { doctorId, type, date, startTime, endTime, selectedDays, startDate, endDate } = req.body;

    if (!doctorId || !type || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "Daily" && !date) {
      return res.status(400).json({ message: "Daily slots require a date" });
    }

    if (type === "Weekly" && (!selectedDays || !startDate || !endDate)) {
      return res.status(400).json({ message: "Weekly slots require selected days, start date, and end date" });
    }

    const newSlot = new TimeSlot({
      doctorId,
      type,
      date,
      startTime,
      endTime,
      selectedDays,
      startDate,
      endDate,
    });

    await newSlot.save();
    res.status(201).json({ message: "Time slot added successfully", slot: newSlot });
  } catch (error) {
    console.error("Error adding time slot:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get all time slots for a doctor
router.get("/get-slots/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const slots = await TimeSlot.find({ doctorId });

    res.status(200).json({ slots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Delete a time slot by ID
router.delete("/delete-slot/:slotId", async (req, res) => {
  try {
    const { slotId } = req.params;

    if (!slotId) {
      return res.status(400).json({ message: "Slot ID is required" });
    }

    const deletedSlot = await TimeSlot.findByIdAndDelete(slotId);

    if (!deletedSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    res.status(200).json({ message: "Time slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting time slot:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
