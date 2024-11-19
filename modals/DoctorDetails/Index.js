
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
  once: [{
    date: { type: String, required: true },
    timefrom: { type: String, required: true },
    timetill: { type: String, required: true },
    consultationfees: { type: String, required: false },
  }],
  daily: [{
    datefrom: { type: String, required: true },
    datetill: { type: String, required: true },
    timefrom: { type: String, required: true },
    timetill: { type: String, required: true },
    consultationfees: { type: String, required: true },
  }],
  weekly: [{
    day: { type: String, required: true },
    timefrom: { type: String, required: true },
    timetill: { type: String, required: true },
    consultationfees: { type: String, required: true },
  }],
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
    date: { type: String, required: true },
    timefrom: { type: String, required: true },
    timetill: { type: String, required: true },
    consultationfees: { type: String, required: true },
  }],
  daily: [{
    datefrom: { type: String, required: true },
    datetill: { type: String, required: true },
    timefrom: { type: String, required: true },
    timetill: { type: String, required: true },
    consultationfees: { type: String, required: true },
  }],
  weekly: [{
    day: { type: String, required: true },
    timefrom: { type: String, required: true },
    timetill: { type: String, required: true },
    consultationfees: { type: String, required: true },
  }],
});

const doctordetails = mongoose.model("DOCTORDETAILS", doctordetailsSchema);
const pendingdoctors = mongoose.model("PENDINGDOCTOR", Pendingdoctor);

module.exports = { doctordetails, pendingdoctors };
