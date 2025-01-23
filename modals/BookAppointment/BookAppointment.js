const express = require('express');
const router = express.Router();
const { BookingAppointment, BookingAppointmentDetail } = require('../models/bookappointment'); // Adjust path as needed

router.post('/bookappointment', async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Crucial debugging step

        // 1. Data Type Conversion and Validation:
        const { selectedDate, selectedTimeSlot, doc_id, bookingDate, userId, Fees } = req.body;

        if (!selectedDate || !selectedTimeSlot || !doc_id || !bookingDate || !userId || !Fees) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const parsedBookingDate = new Date(bookingDate);
        const parsedSelectedDate = new Date(selectedDate);
        const parsedFees = Number(Fees);

        if (isNaN(parsedBookingDate.getTime()) || isNaN(parsedSelectedDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format. Please use ISO 8601 format." });
        }

        if (isNaN(parsedFees)) {
            return res.status(400).json({ success: false, message: "Invalid Fees format. Please use a valid number." });
        }
        // 2. Create Appointment Data
        const appointmentData = {
            selectedDate: parsedSelectedDate.toISOString(), // Store as ISO string in DB
            selectedTimeSlot,
            doc_id,
            bookingDate: parsedBookingDate.toISOString(), // Store as ISO string in DB
            userId,
            Fees: parsedFees.toString(), // Store as string in DB
        };

        const newAppointment = new BookingAppointment(appointmentData);
        await newAppointment.save();

        // Example to save to BookingAppointmentDetail if needed
        const appointmentDetailData = {
            doc_id,
            userId,
            bookingDate: parsedBookingDate.toISOString(),
            bookingFor: selectedTimeSlot, // Or any other relevant info
            Fees: parsedFees.toString(),
        };
        const newAppointmentDetail = new BookingAppointmentDetail(appointmentDetailData);
        await newAppointmentDetail.save();

        res.status(201).json({ success: true, message: "Appointment successfully booked." });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ success: false, message: "Error booking appointment.", error: error.message }); // Send error message for debugging
    }
});

module.exports = router;