
const mongoose = require('mongoose');
// const doctorSchema = new mongoose.Schema({
//     doc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DOCTORDETAILS' },
//     // You can include other fields related to the doctor here
//   });
  
  const officeSchema = new mongoose.Schema({
    image: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    phone: { type: String, required: false, unique: true },
    password: { type: String, required: false },
    officename: { type: String, required: false },
    officeemail: { type: String, required: false },
    officephone: { type: String, required: false },
    officewebsite: { type: String, required: false },
    officespecialty: { type: String, required: false },
    country: { type: String, required: false },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zipcode: { type: String, required: false },
    // doctors: [doctorSchema], // List of doctors associated with the hospital
  });
// const officeSchema = new mongoose.Schema({
//   image: { type: String, required: true },
//   name: { type: String, required: true },
//   email: { type: String, required: false,unique: true },
//   phone: { type: String, required: false,unique: true },
//   password: { type: String, required: false },
//   officename: { type: String, required: false },
//   officeemail: { type: String, required: false },
//   officephone: { type: String, required: false },
//   officewebsite: { type: String, required: false },
//   officespecialty: { type: String, required: false },
//   country: { type: String, required: false },
//   street: { type: String, required: false },
//   city: { type: String, required: false },
//   state: { type: String, required: false },
//   zipcode: { type: String, required: false },



// //   specialization: { type: String, required: true },
// //   conditionstreated: { type: String, required: true },
// //   aboutself: { type: String, required: true },
// //   education: { type: String, required: false },
// //   college: { type: String, required: false },
// //   license: { type: String, required: false },
// //   yearofexperience: { type: String, required: false },

// //   once: [{
// //     date: { type: String, required: true },
// //     timefrom: { type: String, required: true },
// //     timetill: { type: String, required: true },
// //     consultationfees: { type: String, required: true },
// //   }],
// //   daily: [{
// //     datefrom: { type: String, required: true },
// //     datetill: { type: String, required: true },
// //     timefrom: { type: String, required: true },
// //     timetill: { type: String, required: true },
// //     consultationfees: { type: String, required: true },
// //   }],
// //   weekly: [{
// //     day: { type: String, required: true },
// //     timefrom: { type: String, required: true },
// //     timetill: { type: String, required: true },
// //     consultationfees: { type: String, required: true },
// //   }],
// });
// const Pendingdoctor = new mongoose.Schema({
//   image: { type: String, required: true },
//   name: { type: String, required: true },
//   email: { type: String, required: false,unique: true },
//   password: { type: String, required: false },
//   specialization: { type: String, required: true },
//   conditionstreated: { type: String, required: true },
//   aboutself: { type: String, required: true },
//   education: { type: String, required: false },
//   college: { type: String, required: false },
//   license: { type: String, required: false },
//   yearofexperience: { type: String, required: false },

//   once: [{
//     date: { type: String, required: true },
//     timefrom: { type: String, required: true },
//     timetill: { type: String, required: true },
//     consultationfees: { type: String, required: true },
//   }],
//   daily: [{
//     datefrom: { type: String, required: true },
//     datetill: { type: String, required: true },
//     timefrom: { type: String, required: true },
//     timetill: { type: String, required: true },
//     consultationfees: { type: String, required: true },
//   }],
//   weekly: [{
//     day: { type: String, required: true },
//     timefrom: { type: String, required: true },
//     timetill: { type: String, required: true },
//     consultationfees: { type: String, required: true },
//   }],
// });

const office = mongoose.model("Hospital", officeSchema);
// const pendingdoctors = mongoose.model("PENDINGDOCTOR", Pendingdoctor);

module.exports = { office };
