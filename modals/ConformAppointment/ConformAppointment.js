const mongoose = require("mongoose");

const ConformAppointmentSchema = new mongoose.Schema({
    docId: { type: String, required: true },
    userId: { type: String, required: true },
});

const ConformAppointment = mongoose.model("ConformAppointment", ConformAppointmentSchema);

module.exports = { ConformAppointment };
