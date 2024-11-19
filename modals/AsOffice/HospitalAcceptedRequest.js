const mongoose = require('mongoose');

const HospitalAcceptedRequest = new mongoose.Schema({
    Hos_Id: { type: String, required: false },
    doc_id: { type: String, required: false },
   
});

const HospitalAcceptedRequests = mongoose.model('HospitalAcceptedRequest', HospitalAcceptedRequest);

module.exports = { HospitalAcceptedRequests };