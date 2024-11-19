const mongoose = require('mongoose');

const AvaibleTime = new mongoose.Schema({
  
    doc_id: { type: String, required: false },
    date: { type: String, required: false },
    session1: {
        startTime: { type: String, required: false },
        endTime: { type: String, required: false },
    },
    session2: {
        startTime: { type: String, required: false },
        endTime: { type: String, required: false },
    },

});

const AvaibleTimes = mongoose.model('AvaibleTime', AvaibleTime);

module.exports = { AvaibleTimes };
