const mongoose = require('mongoose');

const HospitalRequest = new mongoose.Schema({
    Hos_Id: { type: String, required: false },
    doc_id: { type: String, required: false },
   
});

const HospitalRequests = mongoose.model('HospitalRequest', HospitalRequest);

module.exports = { HospitalRequests };