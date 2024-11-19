const mongoose = require('mongoose');

const Prescription = new mongoose.Schema({
    userId: { type: String, required: false },
    doc_id: { type: String, required: false },
    name: { type: String, required: false },
    quantity: { type: String, required: false },
    days: { type: String, required: false },
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
    image: { type: String , required: false},
    reporttitle: { type: String , required: false},
    reportcagatory: { type: String , required: false}
    // date:{ type: String, required: false }

});

const Prescriptions = mongoose.model('Prescription', Prescription);

module.exports = { Prescriptions };