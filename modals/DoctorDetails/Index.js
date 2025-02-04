
const mongoose = require('mongoose');

const doctordetailsSchema = new mongoose.Schema({
  image: { type: String, required: false },
  verification: { type: String, required: false },
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  specialization: { type: String, required: true },
  conditionstreated: { type: String, required: true },
  aboutself: { type: String, required: true },
  education: { type: String, required: false },
  college: { type: String, required: false },
  license: { type: String, required: false },
  yearofexperience: { type: String, required: false },
  status: { type: Boolean, default: false },
  country: { type: String, required: false },
  state: { type: String, required: false },
  city: { type: String, required: false },
  visitreason :{type: String, require:false},
  once: {
    type: [{
      date: { type: String, required: false },
      timefrom: { type: String, required: false },
      timetill: { type: String, required: false },
      consultationfees: { type: String, required: false },
    }],
    default: undefined,
  },
  daily: {
    type: [{
      datefrom: { type: String, required: false },
      datetill: { type: String, required: false },
      timefrom: { type: String, required: false },
      timetill: { type: String, required: false },
      consultationfees: { type: String, required: false },
    }],
    default: undefined,
  },
  weekly: {
    type: [{
      day: { type: String, required: false },
      timefrom: { type: String, required: false },
      timetill: { type: String, required: false },
      consultationfees: { type: String, required: false },
    }],
    default: undefined,
  },
});

const Pendingdoctor = new mongoose.Schema({
  image: { type: String, required: false },
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  specialization: { type: String, required: true },
  conditionstreated: { type: String, required: true },
  aboutself: { type: String, required: true },
  education: { type: String, required: false },
  college: { type: String, required: false },
  license: { type: String, required: false },
  yearofexperience: { type: String, required: false },
  status: { type: Boolean, default: false },
  country: { type: String, required: false },
  state: { type: String, required: false },
  city: { type: String, required: false },
  once: [{
    date: { type: String, required: false },
    timefrom: { type: String, required: false },
    timetill: { type: String, required: false },
    consultationfees: { type: String, required: false },
  }],
  daily: [{
    datefrom: { type: String, required: false },
    datetill: { type: String, required: false },
    timefrom: { type: String, required: false },
    timetill: { type: String, required: false },
    consultationfees: { type: String, required: false },
  }],
  weekly: [{
    day: { type: String, required: false },
    timefrom: { type: String, required: false },
    timetill: { type: String, required: false },
    consultationfees: { type: String, required: false },
  }],
});

const doctordetails = mongoose.model("DOCTORDETAILS", doctordetailsSchema);
const pendingdoctors = mongoose.model("PENDINGDOCTOR", Pendingdoctor);

module.exports = { doctordetails, pendingdoctors };
