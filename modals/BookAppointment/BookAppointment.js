const mongoose = require('mongoose');

// Define the schema for booking appointments
const bookappointment = new mongoose.Schema({
    selectedDate: { type: String, required: true },
    selectedTimeSlot: { type: String, required: true },
    doc_id: { type: String, required: true },
    bookingDate: { type: String, required: true },
    userId: { type: String, required: true },
    Fees: { type: String, required: true },
});

const BookingAppointment = mongoose.model("BOOKINGAPPOINTMENT", bookappointment);

// Function to filter and save appointment data
const saveAppointmentData = async (data) => {
    try {
        // Extract only the required fields
        const appointmentData = {
            selectedDate: data.selectedDate,
            selectedTimeSlot: data.selectedTimeSlot,
            doc_id: data.doc_id,
            bookingDate: new Date().toISOString(),
            userId: data.userId,
            Fees: data.Fees,
        };

        // Save to the database
        const newAppointment = new BookingAppointment(appointmentData);
        await newAppointment.save();
        return { success: true, message: "Appointment booked successfully." };
    } catch (error) {
        return { success: false, message: "Failed to book appointment.", error };
    }
};

module.exports = { BookingAppointment, saveAppointmentData };
