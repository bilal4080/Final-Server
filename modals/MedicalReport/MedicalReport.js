const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
      },
      BloodReport: String,
      STscan: String,
      MRI: String
});

const MedicalReport = mongoose.model('MedicalReport', MedicalRecordSchema);

module.exports = {MedicalReport};
//hi
