const express = require('express');
const router = express.Router();
const http = require("http");
const socketIo = require("socket.io");
const { User } = require("../../modals/Logins/UserLogin");
const { doctordetails, pendingdoctors } = require("../../modals/DoctorDetails/Index")
const { BookingAppointment, BookingAppointmentDetail } = require("../../modals/BookAppointment/BookAppointment")
const { ConformAppointment } = require("../../modals/ConformAppointment/ConformAppointment")
const { Notification } = require("../../modals/Notification/Notification")
const { PatientProfile } = require("../../modals/PaitentProfile/PatientProfile")
const { MedicalRecords } = require("../../modals/MedicalRecord/MedicalRecord")
const { Prescriptions } = require("../../modals/Prescription/Prescription")
const { office } = require("../../modals/AsOffice/Office")
const { HospitalRequests } = require("../../modals/AsOffice/HospitalRequest")
const { HospitalAcceptedRequests } = require("../../modals/AsOffice/HospitalAcceptedRequest")
const { AvaibleTimes } = require("../../modals/DoctorAvaibleTime/AvaibleTime")
const { AvailableTimings } = require("../../modals/DoctorAvaibleTime/DoctorTimes")
const { MedicalReport } = require("../../modals/MedicalReport/MedicalReport");
const { Wallet } = require("../../modals/Wallet/Wallet");
const DoctorStatus = require("../../modals/DoctorStatus/DoctorStatus");

const axios = require("axios");
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

app.use('/uploads', express.static('uploads'));
app.use(express.json());
const Pusher = require("pusher");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { authenticateToken } = require('../../authentication');
const { log } = require('console');
const Review = require('../../modals/Reviews/Rev');
const Favourite = require('../../modals/Favourite/Favourite');
app.use(cors());
app.use(express.json());

router.use((req, res, next) => {
  // Middleware logic here
  next();
});


const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};


////////IMDFX/////
// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password || !phone) {
      return res.status(400).json('All fields (username, email, password, phone) are required');
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json('User with this email already exists');
    }

    // Create and save the new user
    const user = new User({ username, email, password, phone });
    await user.save();

    res.status(200).json('Signup successful');
  } catch (error) {
    res.status(500).json('Error saving user to the database');
  }
});

// user Login  route
const crypto = require('crypto'); // Ensure crypto is imported




router.post('/login', async (req, res) => {
  console.log("Login API called");

  try {
    const { email, password } = req.body;
    console.log("Received Data:", email, password);

    if (!email || !password) {
      return res.status(400).json('Email and Password are required');
    }

    const user = await User.findOne({ email }).exec();
    console.log("Fetched User:", user);

    if (!user) {
      return res.status(404).json('User not found');
    }

    if (user.password !== password) {
      return res.status(401).json('Invalid password');
    }

    const secretKey = generateSecretKey(); // Fixed function
    console.log("Secret Key:", secretKey);

    const token = jwt.sign({ userId: user._id }, secretKey);
    console.log("Generated Token:", token);

    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json('Error finding user');
  }
});


// Doctor Login route
router.post('/doctorlogin', async (req, res) => {

  try {
    const { email, password, accountType } = req.body;

    if (accountType === "office") {

      const offices = await office.findOne({ email }).exec();

      if (!offices) {
        return res.status(404).json('Office not found');
      }

      if (offices.password !== password) {
        return res.status(401).json('Invalid password');
      }

      const secretKey = generateSecretKey();
      const token = jwt.sign({ email: offices._id }, secretKey);

      // Respond with a success message and the user ID
      res.status(200).json({
        message: 'Login successful',
        userId: offices._id,
        token: token,
      });

    } else {
      const doctor = await doctordetails.findOne({ email }).exec();
      if (!doctor) {
        return res.status(404).json('Doctor not found');
      }
      if (doctor.password !== password) {
        return res.status(401).json('Invalid password');
      }

      const secretKey = generateSecretKey();
      const token = jwt.sign({ email: doctor._id }, secretKey);

      // Respond with a success message and the user ID
      res.status(200).json({
        message: 'Login successful',
        userId: doctor._id,
        token: token,
      });
    }

  } catch (error) {
    res.status(500).json('Error finding user');
  }
});


//getpatient with id use on dasboard to get the user data 
router.get('/getpatient/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Find the doctor details based on the ID
    const patientdetail = await User.findOne({ _id: id });

    if (!patientdetail) {
      return res.status(404).json({ error: 'patient not found' });
    }

    // Send the doctor details as a JSON response
    res.status(200).json(patientdetail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving patient details', details: error.message });
  }
});

//getpatient
router.get('/getpatient', async (req, res) => {

  try {
    const patientdetail = await User.find();
    res.status(200).json(patientdetail);
  } catch (error) {
    res.send(error);
  }
});

//add doctor  details
router.post('/registerdoc', upload.single('image'), async (req, res) => {
  try {
    const { body, file } = req;

    // Check if the doctor is already registered
    const existingDoctor = await doctordetails.findOne({ email: body.email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor is already registered!' });
    }

    // Prepare the data for the new doctor
    const newDoctorDetails = new pendingdoctors({
      image: file ? file.path : null,
      verification: body.verification ? body.verification.path : null,
      name: body.name,
      email: body.email,
      password: body.password,
      specialization: body.specialization,
      conditionstreated: body.conditionstreated,
      aboutself: body.aboutself,
      education: body.education,
      college: body.college,
      license: body.license,
      yearofexperience: body.yearofexperience,
      country: body.country,
      state: body.state,
      city: body.city,
      visitreason:body.visitreason,
      once: body.once || [],
      daily: body.daily || [],
      weekly: body.weekly || [],
      status: body.status || false,
    });
    // Save the new doctor details to the database
    await newDoctorDetails.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//get DoctorDetails
router.get("/doctorpersnoldetails", async (req, res) => {
  try {
    const doctordetail = await doctordetails.find();
    res.status(200).json(doctordetail);
  } catch (error) {
    res.send(error);
  }
});

//get pending doctor details for approved
router.get("/pendingdoctordetail", async (req, res) => {
  try {
    const doctordetail = await pendingdoctors.find();
    res.status(200).json(doctordetail);
  } catch (error) {
    res.send(error);
  }
});
//get appointments
router.get("/getallbookappointment", async (req, res) => {
  try {
    const appoimentdetail = await BookingAppointment.find();
    res.status(200).json(appoimentdetail);
  } catch (error) {
    res.send(error);
  }
});

// get book appointment with user id and doctor id
router.post("/getbookappointmenttime/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const { doc_id } = req.body;
    console.log("doc_Iddoc_Id", doc_id);
    // Fetch all appointments for the user
    // const userAppointments = await BookingAppointmentDetail.find({ userId: userId });
    const userAppointments = await BookingAppointmentDetail.find({
      userId: userId,
      doc_id: doc_id // Assuming doc_id field contains the doctor's user id
    });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const doctorDetails = await doctordetails.findById(appointment.doc_id);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        doctorDetails: doctorDetails,
        details: userAppointments,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// get book appointment with user id 
router.get("/getbookappointment/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    // const { doc_id } = req.body;
    // console.log("doc_Iddoc_Id",doc_id);
    // Fetch all appointments for the user
    const userAppointments = await BookingAppointmentDetail.find({ userId: userId });
    // const userAppointments = await BookingAppointmentDetail.find({ userId: userId, });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const doctorDetails = await doctordetails.findById(appointment.doc_id);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        doctorDetails: doctorDetails,
        details: userAppointments,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//store BookAppointment
router.post('/bookappointment', async (req, res) => {
  try {
    // Extract only the required fields from the request body
    const { selectedDate, selectedTimeSlot, doc_id, userId, Fees } = req.body;

    // Validate the required fields
    if (!selectedDate || !selectedTimeSlot || !doc_id || !userId || !Fees) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the booking appointment data
    const newBookAppointment = new BookingAppointment({
      doc_id,
      selectedDate,
      selectedTimeSlot,
      bookingDate: new Date().toISOString(), // Automatically set the booking date
      userId,
      Fees,
    });

    // Save to the database
    await newBookAppointment.save();

    // Console log the successful booking data
    console.log('Successful Booking:', {
      doc_id,
      selectedDate,
      selectedTimeSlot,
      bookingDate: newBookAppointment.bookingDate,
      userId,
      Fees,
    });

    res.status(200).json({ success: true, message: 'Book appointment successfully' });

  } catch (error) {
    console.error('Error saving booking appointment:', error);
    res.status(500).json({ error: 'Error saving booking appointment to the database' });
  }
});

// get BookAppointment with Doctor details
router.get("/appointments/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all appointments for the user
    const userAppointments = await BookingAppointment.find({ userId: userId });

    if (!userAppointments || userAppointments.length === 0) {
      return res.status(201).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithDoctors = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const doctorDetails = await doctordetails.findById(appointment.doc_id);

      // Create an object with appointment and doctor details
      const appointmentWithDoctor = {
        appointmentDetails: appointment,
        doctorDetails: doctorDetails,
      };

      // Add the object to the array
      appointmentsWithDoctors.push(appointmentWithDoctor);
    }

    res.status(200).json(appointmentsWithDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getappointments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch appointments from the database by userId
    const appointments = await BookingAppointment.find({ userId });

    // Check if appointments exist
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this user' });
    }

    res.status(200).json({ success: true, appointments });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Error fetching appointments from the database' });
  }
});



router.get('/doctor/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Check in the doctordetails collection first
    const doctor = await doctordetails.findById(doctorId);
    if (doctor) {
      return res.status(200).json(doctor); // Return doctor data if found
    }

    // If not found, check in the pendingdoctors collection
    const pendingDoctor = await pendingdoctors.findById(doctorId);
    if (pendingDoctor) {
      return res.status(200).json(pendingDoctor); // Return pending doctor data if found
    }

    // If doctor not found in both collections
    return res.status(404).json({ message: 'Doctor not found' });
  } catch (error) {
    console.error('Error fetching doctor data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});





// get BookAppointment with patient Id  details
router.get("/doc_appointments/:docId", async (req, res) => {

  try {
    const docId = req.params.docId;
    console.log("docId", docId);
    // Fetch all appointments for the user
    const userAppointments = await BookingAppointment.find({ doc_id: docId });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const PatietnDetails = await User.findById(appointment.userId);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        PatietnDetails: PatietnDetails,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//api for acceting or rehecting the appitment 
router.post("/manage_appointment/:docId", async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);

    const docId = req.params.docId;
    const { appointmentId, status } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required" });
    }

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'confirmed' or 'rejected'" });
    }

    // Find and update the appointment
    const updatedAppointment = await BookingAppointment.findOneAndUpdate(
      { _id: appointmentId, doc_id: docId },
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json({ 
      message: `Appointment has been ${status} successfully`, 
      updatedAppointment 
    });
  } catch (error) {
    console.error("Error managing appointment:", error);
    res.status(500).json({ error: "Error managing appointment", details: error.message });
  }
});

router.get("/manage_appointments/:docId", async (req, res) => {
  try {
    const docId = req.params.docId;
    
    // Fetch only pending appointments
    const pendingAppointments = await BookingAppointment.find({ doc_id: docId, status: "pending" });

    if (!pendingAppointments.length) {
      return res.status(404).json({ error: "No pending appointments found" });
    }

    res.status(200).json(pendingAppointments);
  } catch (error) {
    console.error("Error fetching pending appointments:", error);
    res.status(500).json({ error: "Error fetching pending appointments", details: error.message });
  }
});


//accepted appo by doctor
// Get all confirmed appointments for a doctor
router.get("/confirmed_appointments/:docId", async (req, res) => {
  try {
    const docId = req.params.docId;
    console.log("Doctor ID received:", docId); // Log docId to verify

    // Fetch all confirmed (accepted) appointments for the doctor
    const confirmedAppointments = await BookingAppointment.find({ doc_id: docId, status: "confirmed" });

    console.log("Confirmed Appointments:", confirmedAppointments); // Log fetched data

    if (!confirmedAppointments.length) {
      return res.status(404).json({ error: "No confirmed appointments found" });
    }

    // Fetch patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      confirmedAppointments.map(async (appointment) => {
        try {
          const patient = await User.findById(appointment.userId).select("username email").lean();

          console.log("Fetched Patient:", patient); // Debugging log

          return {
            appointmentDetails: appointment,
            patientName: patient?.username || "Unknown", // Ensure username is added
            patientEmail: patient?.email || "Not available",
          };
        } catch (error) {
          console.error("Error fetching patient details:", error);
          return {
            appointmentDetails: appointment,
            patientName: "Error fetching username",
            patientEmail: "Error fetching email",
          };
        }
      })
    );

    res.status(200).json(appointmentsWithPatients);
  } catch (error) {
    console.error("Error fetching confirmed appointments:", error);
    res.status(500).json({ error: "Error fetching confirmed appointments", details: error.message });
  }
});




//get all rejected appo
router.get("/rejected_appointments/:docId", async (req, res) => {
  try {
    const docId = req.params.docId;
    console.log("Doctor ID received:", docId); // Log docId to verify

    const rejectedAppointments = await BookingAppointment.find({ doc_id: docId, status: "rejected" });

    console.log("Rejected Appointments:", rejectedAppointments); // Log fetched data

    if (!rejectedAppointments.length) {
      return res.status(404).json({ error: "No rejected appointments found" });
    }

    res.status(200).json(rejectedAppointments);
  } catch (error) {
    console.error("Error fetching rejected appointments:", error);
    res.status(500).json({ error: "Error fetching rejected appointments", details: error.message });
  }
});







// Fetch all notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// user notify for transection
router.post('/usertransectionnotification/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { message } = req.body;
    console.log("message", message);
    // const message = 'Your Transection is successfull.';
    const newNotification = new Notification({ userId, message });
    await newNotification.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// API endpoint to mark a notification as read
router.post('/markAsRead/:notificationId', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;

    // Update the notification in the database to mark it as read
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true } // Return the updated notification
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Cancel doctor appointment
router.post('/cancelappointment/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await BookingAppointment.deleteOne({ _id: id });

    res.status(200).json('Appointment Cancel successful');
  } catch (error) {
    res.status(500).json('Internal server Error');
  }
});

// get mypatient details, doctor id  for doctor dashboard
router.get("/mypatient/:docId", async (req, res) => {

  try {
    const docId = req.params.docId;
    console.log("docId", docId);
    // Fetch all appointments for the user
    const userAppointments = await ConformAppointment.find({ docId: docId });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const PatietnDetails = await User.findById(appointment.userId);
      const docId = appointment.docId
      const userId = appointment.userId
      const appointmentDetail = await BookingAppointmentDetail.find({ doc_id: docId, userId: userId });

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointmentDetail,
        PatietnDetails: PatietnDetails,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get mydoctor details, patient id  for patient dashboard
router.get("/mydoctor/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;

    // Fetch all appointments for the user
    const userAppointments = await ConformAppointment.find({ userId: userId });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(201).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const doctorDetails = await doctordetails.findById(appointment.docId);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        doctorDetails: doctorDetails,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get  user peyment details, patient id  for patient dashboard
router.get("/mypayments/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const payments = await Wallet.find({ userId: userId });
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// get doctor transaction, peyment details, patient id  for patient dashboard
router.get("/doctorTransactions/:doc_id", async (req, res) => {

  try {
    const doc_id = req.params.doc_id;
    const payments = await Wallet.find({ doc_id: doc_id });
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/update-patient-profile/:userId', upload.single('image'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const file = req.file;
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      mobile,
      address,
      city,
      state,
      zipCode,
      country,
    } = req.body;
    // Find the user by ID
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(200).json({ message: 'Patient Profile  is Not Found!' });
    }

    // Check if the user exists in the PatientProfile collection
    const patientProfile = await PatientProfile.findOne({ userId: userId });

    if (!patientProfile) {
      // If patient profile doesn't exist, create a new profile
      const newPatientProfile = new PatientProfile({
        image: file ? file.path : null,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        email: email,
        mobile: mobile,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,
        userId: userId,
      });

      // Save the data to the database
      await newPatientProfile.save();
      return res.status(200).json('Profile created successfully');
    } else {
      // If patient profile exists, update the profile
      await PatientProfile.findOneAndUpdate(
        { userId: userId },
        {
          image: file ? file.path : null,
          firstName: firstName,
          lastName: lastName,
          dateOfBirth: dateOfBirth,
          email: email,
          mobile: mobile,
          address: address,
          city: city,
          state: state,
          zipCode: zipCode,
          country: country,
        }
      );
      return res.status(200).json('Profile updated successfully');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json('Error updating profile');
  }
});


// get patient patient profile 
router.get("/getpatient-profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await PatientProfile.find({ userId: userId });
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//doctor update own profile 
router.post('/update-doctor-profile/:docId',
  // upload.single('image'),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("body", req.body);
      const {
        firstName,
        lastName,
        dateOfBirth,
        email,
        mobile,
        address,
        city,
        state,
        zipCode,
        country,
        file
      } = req.body;

      // Find the user by ID
      const user = await User.findOne({ _id: userId });
      ;

      if (!user) {
        return res.status(200).json({ message: 'Patient Profile  is Not Found!' });
      }
      // Create a new doctordetails instance with the received data
      const patientProfile = new PatientProfile({
        image: file ? file.path : null, // Assuming you want to store the file path
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        email: email,
        mobile: mobile,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,

      });

      // Save the data to the database
      await patientProfile.save();


      res.status(200).json('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json('Error updating profile');
    }
  });

// change password of user
router.post("/change-user-password/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Fetch user from the database
    const user = await User.findById(userId);

    // Check if the old password matches the stored password
    if (user && user.password === oldPassword) {
      // Update the password if old password matches
      user.password = newPassword;
      await user.save();
      res.status(200).json("Password changed successfully");
    } else {
      res.status(400).json("Old password is incorrect");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json("Error changing password");
  }
});
// change password of doctor
router.post("/change-doctor-password/:doc_Id", async (req, res) => {
  try {
    const doc_Id = req.params.doc_Id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Fetch user from the database
    const user = await doctordetails.findById(doc_Id);

    // Check if the old password matches the stored password
    if (user && user.password === oldPassword) {
      // Update the password if old password matches
      user.password = newPassword;
      await user.save();
      res.status(200).json("Password changed successfully");
    } else {
      res.status(400).json("Old password is incorrect");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json("Error changing password");
  }
});

// forgot password
router.post('/reset-user-password', async (req, res) => {
  const { email } = req.body;
  console.log("email", email);
  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new password (you might want to implement a more secure method)
    const newPassword = Math.random().toString(36).slice(-8);

    // Update the user's password in the database
    user.password = newPassword;
    await user.save();

    // Send an email to the user with the new password
    await transporter.sendMail({
      from: '',
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`,
    });

    res.status(200).json({ message: 'Password reset successful. Check your email for the new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// search doctor  by specialization
router.get('/doctors-by-specialty/:specialty', async (req, res) => {
  try {
    const specialization = req.params.specialty;
    console.log('Specialization received:', specialization);

    const doctors = await doctordetails.find({ specialization });
    console.log('Doctors fetched:', doctors);

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found for this specialty' });
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    res.status(500).json({ message: 'Error fetching doctors by specialty' });
  }
});



// get appointment detail with doctor and user detail
router.get('/appointment-alldetails', async (req, res) => {
  try {
    const appointments = await BookingAppointmentDetail.find();
    // console.log("appointments",appointments);
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        // console.log("appointment", appointment.doc_id);
        const doctorDetail = await doctordetails.findById({ _id: appointment.doc_id });
        const userDetail = await User.findById({ _id: appointment.userId });

        return {
          bookingDetail: appointment,
          doctorDetail,
          userDetail,
        };
      })
    );
    console.log("appointmentsWithDetails", appointmentsWithDetails);
    res.json(appointmentsWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get appointment detail with doc id
router.get('/appointment-details/:doc_Id', async (req, res) => {
  try {
    const doc_id = req.params.doc_Id;
    const appointments = await BookingAppointmentDetail.find({ doc_id: doc_id });
    // console.log("appointments",appointments);
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        console.log("appointment", appointment.doc_id);
        const doctorDetail = await doctordetails.findById({ _id: appointment.doc_id });
        const userDetail = await User.findById({ _id: appointment.userId });

        return {
          bookingDetail: appointment,
          doctorDetail,
          userDetail,
        };
      })
    );
    console.log("appointmentsWithDetails", appointmentsWithDetails);
    res.json(appointmentsWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add medical record
router.post("/medicaldetails/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const {
      bmi,
      hr,
      Weight,
      Fbc,
      dob
    } = req.body;

    // Create a new doctordetails instance with the received data
    const MedicalRecord = new MedicalRecords({
      userId: userId,
      bmi: bmi,
      hr: hr,
      Weight: Weight,
      Fbc: Fbc,
      dob: dob

    });


    await MedicalRecord.save();
    res.status(201).json("MedicalRecords submitted successfully!");
  } catch (error) {
    console.error("Error submitting form data:", error);
    res.status(500).json("Internal Server Error");
  }
});

//get appointments
router.get("/getmedicaldetails/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const MedicalRecord = await MedicalRecords.find({ userId: userId });
    res.status(200).json(MedicalRecord);
  } catch (error) {
    res.send(error);
  }
});

router.put("/updatemedicaldetails/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const {
      bmi,
      hr,
      Weight,
      Fbc,
      dob
    } = req.body;

    // Find the existing medical record for the user
    const existingRecord = await MedicalRecords.findOne({ userId: userId });

    if (!existingRecord) {
      return res.status(404).json("Medical record not found for the user");
    }

    // Update the medical record with the new data
    existingRecord.bmi = bmi;
    existingRecord.hr = hr;
    existingRecord.Weight = Weight;
    existingRecord.Fbc = Fbc;
    existingRecord.dob = dob;

    // Save the updated record
    await existingRecord.save();

    res.status(200).json("MedicalRecords updated successfully!");
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json("Internal Server Error");
  }
});

// DELETE route for deleting medical details
router.post("/deletemedicaldetails/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("click");
  try {
    // Find and delete the medical record for the specified user
    const result = await MedicalRecords.findOneAndDelete({ userId: userId });

    if (result) {
      res.status(200).json("MedicalRecords deleted successfully!");
    } else {
      res.status(404).json("MedicalRecords not found for the specified user.");
    }
  } catch (error) {
    console.error("Error deleting medical record:", error);
    res.status(500).json("Internal Server Error");
  }
});


router.post('/Prescription',
  //  upload.single('image'),
  async (req, res) => {
    try {
      // Extract form data from the request body
      const {
        userId,
        doc_id,
        name,
        quantity,
        days,
        morning,
        afternoon,
        evening,
        night,
        reporttitle,
        reportcagatory
      } = req.body;
      console.log("file", req.body);
      // Create a new Prescription instance with the received data
      const prescription = new Prescriptions({
        userId,
        doc_id,
        name,
        quantity,
        days,
        morning,
        afternoon,
        evening,
        night,
        image: req.file.filename,
        reporttitle,
        reportcagatory
      });

      // Save the prescription to the database
      await prescription.save();

      res.status(201).json('Prescription submitted successfully!');
    } catch (error) {
      console.error('Error submitting prescription:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// get prescription with userid  
router.get('/get-prescriptions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all prescriptions for the given user
    const prescriptions = await Prescriptions.find({ userId });

    // If prescriptions are found, retrieve doctor details using doc_id
    const prescriptionsWithDetails = await Promise.all(
      prescriptions.map(async (prescription) => {
        // Fetch doctor details using doc_id
        // Replace 'YourDoctorModel' with the actual model for doctor details
        const doctorDetails = await doctordetails.findById(prescription.doc_id);

        return {
          // ...prescription._doc,
          ...prescription,
          doctorDetails,
        };
      })
    );

    res.status(200).json(prescriptionsWithDetails);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add hospital 
router.post('/addOffice', async (req, res) => {
  try {
    const {
      image,
      name,
      email,
      phone,
      password,
      officename,
      officeemail,
      officephone,
      officewebsite,
      officespecialty,
      country,
      street,
      city,
      state,
      zipcode,
      // doctors // Array of doctors
    } = req.body;
    console.log("body", req.body);
    const newOffice = new office({
      image,
      name,
      email,
      phone,
      password,
      officename,
      officeemail,
      officephone,
      officewebsite,
      officespecialty,
      country,
      street,
      city,
      state,
      zipcode,

    });

    const savedOffice = await newOffice.save();
    res.status(201).json(savedOffice);
  } catch (error) {
    console.error('Error adding office:', error);
    res.status(500).json('Internal Server Error');
  }
});

// get all hospitals
router.get('/getallOffice', async (req, res) => {

  try {
    const Hospital = await office.find();
    res.status(200).json(Hospital);
  } catch (error) {
    res.send(error);
  }
});

// doctor requst to hostpital
router.post('/sendrequest/:doc_id', async (req, res) => {
  try {
    const doc_id = req.params.doc_id;
    const {
      Hos_Id

    } = req.body;
    // Check if there is an existing request with the same doc_id and Hos_Id
    const existingRequest = await HospitalRequests.findOne({ doc_id, Hos_Id }).exec();

    if (existingRequest) {
      return res.status(400).json('Doctor request with the same office already exists');
    }

    const newOfficeReq = new HospitalRequests({
      doc_id,
      Hos_Id,
    });

    const savedOffice = await newOfficeReq.save();
    res.status(201).json('Request  submitted successfully!');
  } catch (error) {
    console.error('Error adding office:', error);
    res.status(500).json('Internal Server Error');
  }
});


router.get("/office-doctor-request-details/:Hos_Id", async (req, res) => {

  try {
    const Hos_Id = req.params.Hos_Id;

    const doctorRequest = await HospitalRequests.find({ Hos_Id: Hos_Id });

    if (!doctorRequest || doctorRequest.length === 0) {
      return res.status(404).json({ error: 'doctorRequest not found' });
    }
    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const request of doctorRequest) {
      // Fetch doctor details for each appointment
      const DoctorDetails = await doctordetails.findById(request.doc_id);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        DoctorRequestDetails: request,
        DoctorDetails: DoctorDetails,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//when office accept  doctor request 
router.post('/office-accept-doctor-req/:Hos_Id', async (req, res) => {
  try {
    const Hos_Id = req.params.Hos_Id;
    const { DoctorRequestDetails } = req.body;

    // Step 1: Delete from BookingAppointment
    await HospitalRequests.deleteOne({ _id: DoctorRequestDetails._id });

    // Step 2: Save to ConformAppointment
    const doc_id = DoctorRequestDetails.doc_id;
    const nenRequest = new HospitalAcceptedRequests({ doc_id, Hos_Id });
    await nenRequest.save();
    const userId = DoctorRequestDetails.doc_id;
    // Step 3: Save to Notification
    const message = 'Your Request has been confirmed.';
    const newNotification = new Notification({ userId, message });
    await newNotification.save();

    res.status(200).json('Request Accepted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json('Error Accepted Request');
  }
});

//when office cencal doctor request
router.post('/cancel-doctor-request/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await HospitalRequests.deleteOne({ _id: id });

    res.status(200).json('Request Cancel successful');
  } catch (error) {
    res.status(500).json('Internal server Error');
  }
});

// get doctor  office accepted request 
router.get('/office-accepte-request/:doc_id', async (req, res) => {
  try {
    const doc_id = req.params.doc_id;
    console.log("officeID", doc_id);
    // Find accepted hospital requests for the specified doc_id
    const acceptedRequests = await HospitalAcceptedRequests.find({ doc_id });
    // console.log("acceptedRequests",acceptedRequests);
    // Check if there are no accepted requests
    if (acceptedRequests.length === 0) {
      return res.status(404).json({ message: 'No accepted requests found' });
    }

    // Retrieve office details for each accepted request
    const officeDetails = await Promise.all(
      acceptedRequests.map(async (request) => {
        const officeDetail = await office.findOne({ _id: request.Hos_Id }).exec();
        // console.log("ofice",officeDetail);
        if (!officeDetail) {
          // If office details not found for a request, return an error message
          return { message: `Office details not found for Hos_Id ${request.Hos_Id}` };
        }
        return officeDetail;
      })
    );

    res.status(200).json(officeDetails);
  } catch (error) {
    console.error('Error retrieving office details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// get multple doctor office  which is added in office 
router.post('/office-accept-request', async (req, res) => {
  try {
    const { doc_id } = req.body;

    // Find accepted hospital requests for the specified doc_ids
    const acceptedRequests = await HospitalAcceptedRequests.find({ doc_id: { $in: doc_id } });

    // Check if there are no accepted requests
    if (acceptedRequests.length === 0) {
      return res.status(404).json({ message: 'No accepted requests found' });
    }

    // Retrieve office details for each accepted request
    const officeDetails = await Promise.all(
      acceptedRequests.map(async (request) => {
        console.log("Req", request);
        const officeDetail = await office.findOne({ _id: request.Hos_Id }).exec();
        if (!officeDetail) {
          // If office details not found for a request, return an error message
          return { message: `Office details not found for Hos_Id ${request.Hos_Id}` };
        }
        // Add doc_id to officeDetail
        // Add doc_id to officeDetail
        const officeDetailWithDocId = { ...officeDetail._doc, doc_id: request.doc_id };
        return officeDetailWithDocId;
        // return officeDetail;
        // return {
        //   ...prescription._doc,
        //   ...request,
        //   officeDetail,
        //   doc_id: request.doc_id,
        //   officeDetail,
        // };
      })
    );

    res.status(200).json(officeDetails);
  } catch (error) {
    console.error('Error retrieving office details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// when doctor delete office tee
router.post('/delele-doctor-office/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await HospitalAcceptedRequests.deleteOne({ Hos_Id: id });
    res.status(200).json('Delete office successfull');
  } catch (error) {
    res.status(500).json('Internal server Error');
  }
});

// get doctor for office to show 
router.get('/get-doctor-office/:Hos_Id', async (req, res) => {
  try {
    const Hos_Id = req.params.Hos_Id;

    // Find accepted hospital requests for the specified doc_id
    const acceptedRequests = await HospitalAcceptedRequests.find({ Hos_Id });
    // console.log("acceptedRequests",acceptedRequests);
    // Check if there are no accepted requests
    if (acceptedRequests.length === 0) {
      return res.status(404).json({ message: 'No accepted requests found' });
    }

    // Retrieve office details for each accepted request
    const doctorDetails = await Promise.all(
      acceptedRequests.map(async (request) => {
        const doctorDetails = await doctordetails.findOne({ _id: request.doc_id }).exec();
        // console.log("ofice",officeDetail);
        if (!doctorDetails) {
          // If office details not found for a request, return an error message
          return { message: `Doctor details not found for Hos_Id ${request.doc_id}` };
        }
        return doctorDetails;
      })
    );

    res.status(200).json(doctorDetails);
  } catch (error) {
    console.error('Error retrieving office details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//get current date appoitments
// API endpoint to get appointments for the current date
router.get('/gettodayappointments/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userAppointments = await BookingAppointmentDetail.find({ userId: userId });
    // const currentDate = moment().startOf('day'); 
    // const appointments = await BookingAppointmentDetail.find({     date: { $gte: currentDate.toDate(), $lt: moment(currentDate).endOf('day').toDate() },});
    res.json(userAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/doc_avaibletime/:docId", async (req, res) => {
  const { docId } = req.params;
  const { date, session1, session2 } = req.body;
  console.log("req.body", req.body);

  try {

    const doctorAvailability = new AvaibleTimes({
      doc_id: docId,
      date,
      session1,
      session2,
    });

    await doctorAvailability.save();

    res.status(200).json({ success: true, message: "Doctor availability saved successfully." });
  
  } catch (error) {
    console.error("Error saving/updating doctor availability:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


//get doctor avaibleTime with doctor id
router.get("/get-doc_avaibletime/:docId", async (req, res) => {
  const { docId } = req.params;
  console.log("docId", docId);
  const doc_id = docId
  try {
    // Find doctor availability data from MongoDB based on docId
    const doctorAvailability = await AvailableTimings.find({ doc_id });
    console.log("doctorAvailability", doctorAvailability);
    if (!doctorAvailability) {
      return res.status(404).json("Doctor availability not found.");
    }

    res.status(200).json({ doctorAvailability });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    res.status(500).json("Internal Server Error");
  }
});


// check doctor availability for booking at a specific time slot
router.get('/check-booking-availability/:doc_id/:timeSlot/:selectedDateData', async (req, res) => {
  const { docId, timeSlot, selectedDateData } = req.params;
  // console.log("id",doc_id,"timeslot",timeSlot,selectedDate);
  try {
    // Query the database to check if there is any existing booking for the doctor at the given time slot
    const existingBooking = await BookingAppointmentDetail.findOne({
      doc_id: docId,
      selectedTimeSlot: timeSlot,
      selectedDate: selectedDateData
    });

    if (existingBooking) {
      // Doctor is not available at the specified time slot
      res.status(200).json({ docId, timeSlot, available: false });
    } else {
      // Doctor is available at the specified time slot
      res.status(200).json({ docId, timeSlot, available: true });
    }
  } catch (error) {
    // Handle errors
    console.error('Error checking doctor availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// check doctor availability for booking at a specific time slot
router.get('/check-doctor-availability/:docId/:dayname', async (req, res) => {
  const { docId, dayname } = req.params;

  try {
    // Find the doctor by docId
    if (docId !== "null") {

      const doctor = await doctordetails.findById(docId);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Filter the doctor's weekly schedule to get the time slots for the specified day
      const dayTimeSlots = doctor.weekly.filter(slot => slot.day === dayname);

      // Return the filtered time slots for the specified day
      res.status(200).json({ docId, dayname, timeSlots: dayTimeSlots });
    }


  } catch (error) {
    console.error('Error Get Time of That day:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/medicalreport/:userId', async (req, res) => {
  try {
    uploadSingle.single('image')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log(err)

        return res.status(400).json({ message: err.message, success: false });
      } else if (err) {
        console.log(err)

        // An unknown error occurred when uploading.
        return res.status(500).json({ message: err.message, success: false });
      }
      const { userId } = req.params;
      console.log("reQ", req.body);
      const medicalReport = new MedicalReport({
        userId,
        BloodReport: req.files['BloodReport'] ? req.files['BloodReport'][0].path : null,
        STscan: req.files['STscan'] ? req.files['STscan'][0].path : null,
        MRI: req.files['MRI'] ? req.files['MRI'][0].path : null
      });

      await medicalReport.save();

      res.status(201).json({ message: 'Medical report saved successfully' });



    });
    // const { userId } = req.body;

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/getmedicalreport/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find medical reports for the specified user ID
    const medicalReports = await MedicalReport.find({ userId: userId });

    if (!medicalReports || medicalReports.length === 0) {
      return res.status(404).json({ message: 'Medical reports not found for this user' });
    }

    // If medical reports found, return them
    res.status(200).json({ success: true, data: medicalReports });
  } catch (error) {
    console.error('Error fetching medical reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

///search doctor location 
// Route handler for /api/search-location
router.get('/search-location', async (req, res) => {
  const { query } = req.query; // Get the query string from the request URL
  console.log("query", query);
  try {
    // Perform a case-insensitive search for doctors with locations matching the query
    const searchResults = await doctordetails.find({
      city: { $regex: query, $options: 'i' }
    });
    console.log("searchResults", searchResults);
    res.json(searchResults); // Return the search results as JSON response
  } catch (error) {
    console.error('Error searching location in DoctorDetail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update-office-profile/:officeId', async (req, res) => {
  try {
    const officeId = req.params.officeId;
    console.log("body", req.body);
    const {

      email,
      phone,
      officename,
      officeemail,
      officephone,
      officewebsite,
      officespecialty,
      country,
      street,
      city,
      state,
      zipcode,
      file
    } = req.body;

    // Find the office profile by ID
    const officeProfile = await office.findOne({ _id: officeId });
    if (!officeProfile) {
      return res.status(404).json({ message: 'Office Profile not found' });
    }

    // Update the existing office profile with the received data

    officeProfile.email = email;
    officeProfile.phone = phone;
    officeProfile.officename = officename;
    officeProfile.officeemail = officeemail;
    officeProfile.officephone = officephone;
    officeProfile.officewebsite = officewebsite;
    officeProfile.officespecialty = officespecialty;
    officeProfile.country = country;
    officeProfile.street = street;
    officeProfile.city = city;
    officeProfile.state = state;
    officeProfile.zipcode = zipcode;
    officeProfile.image = file ? file.path : officeProfile.image; // If a new image is provided, update it

    // Save the updated profile to the database
    await officeProfile.save();

    res.status(200).json('Office Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json('Error updating profile');
  }
});

//get signle office detail
router.get('/getofficeDetail/:officeId', async (req, res) => {
  try {
    const { officeId } = req.params;
    console.log("officeId", officeId);
    // Find the office details based on the ID
    const OfficeDetail = await office.findOne({ _id: officeId });
    console.log("OfficeDetail", OfficeDetail);
    if (!OfficeDetail) {
      return res.status(404).json({ error: 'Office not found' });
    }

    // Send the office details as a JSON response
    res.status(200).json(OfficeDetail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving doctor details', details: error.message });
  }
});


// change password of Office 
router.post("/change-office-password/:officeId", async (req, res) => {
  try {
    const officeId = req.params.officeId;
    console.log(officeId);
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Fetch user from the database
    const offices = await office.findById(officeId);

    // Check if the old password matches the stored password
    if (offices && offices.password === oldPassword) {
      // Update the password if old password matches
      offices.password = newPassword;

      await offices.save();
      res.status(200).json("Password changed successfully");
    } else {
      res.status(400).json("Old password is incorrect");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json("Error changing password");
  }
});


// admin update patient status
router.put('/update-patient-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the patient by ID and update the status
    const patient = await User.findByIdAndUpdate(id, { status }, { new: true });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Return the updated patient
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// admin update doctors status
router.put('/update-doctor-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the doctor by ID and update the status
    const doctor = await doctordetails.findByIdAndUpdate(id, { status }, { new: true });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Return the updated patient
    res.status(200).json(doctor);
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//approve doctor
router.put('/approve-doctor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id', id);

    // Find the doctor by ID in the pending doctors collection
    const pendingDoctor = await pendingdoctors.findById(id);
    console.log('pendingDoctor', pendingDoctor);
    if (!pendingDoctor) {
      return res.status(404).json({ message: 'Doctor not found in pending list' });
    }

    // Remove the doctor from the pending doctors collection
    await pendingdoctors.findByIdAndDelete(id);

    // Create a new instance of the approved doctor using the data from the pending doctor
    const approvedDoctor = new doctordetails(pendingDoctor.toObject());

    // Update the status field to true (optional)
    approvedDoctor.status = true;

    // Remove any fields that are not needed in the approved doctors collection
    // delete approvedDoctor.verification;

    // Save the approved doctor to the approved doctors collection
    await approvedDoctor.save();

    // Return the approved doctor
    res.status(200).json(approvedDoctor);
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//add payment to user walllat
router.post('/addpaymentwallet/:userId/:doc_id', async (req, res) => {
  try {
    const { userId, doc_id } = req.params;
    console.log(userId, "+", doc_id);
    const { Amount } = req.body;
    const wallet = new Wallet({ userId, doc_id, Amount });
    console.log("wallet", wallet);
    await wallet.save();
    res.status(201).json({ message: 'Wallet data saved successfully' });
  } catch (error) {
    console.error('Error saving wallet data:', error);
    res.status(500).json({ error: 'Failed to save wallet data' });
  }
});

// API endpoint to retrieve data from the database
router.get('/wallet/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const walletData = await Wallet.findOne({ userId });
    if (walletData) {
      res.status(200).json(walletData);
    } else {
      res.status(404).json({ message: 'Wallet data not found for the user' });
    }
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

// check doctor exist in hospital or not
router.get('/check-doctor-office/:doc_id', async (req, res) => {
  try {
    const doc_id = req.params.doc_id;
    const doctor = await HospitalAcceptedRequests.findOne({ doc_id });
    if (doctor) {
      res.status(200).json(doctor);
    } else {
      res.status(404).json('Doctor is not found any hospital');
    }
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

///add save doctor time slots
router.post('/doctorAvailableTimings', async (req, res) => {
  const { doc_id, startDate, endDate, sessions } = req.body;
  console.log("startDate", startDate, "startDate", startDate);
  try {
    // Check if a record already exists for the given doctor ID and start date
    let availableTiming = await AvailableTimings.findOne({ doc_id, startDate });

    if (availableTiming) {
      // If a record exists, check if the number of sessions is less than 3
      if (availableTiming.sessions.length + sessions.length > 3) {
        return res.status(400).json({ message: 'Cannot add more than 3 slots for the same date' });
      }

      // Append the new sessions to the existing sessions array
      availableTiming.sessions.push(...sessions);
    } else {
      // If no record exists, create a new record with the doctor ID, start date, end date, and sessions array
      availableTiming = new AvailableTimings({
        doc_id,
        startDate,
        endDate,
        sessions
      });
    }

    // Save the updated or new record to the database
    await availableTiming.save();

    // Return a success message
    return res.status(200).json({ message: 'Time added successfully' });
  } catch (error) {
    console.error('Error saving available timings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET API endpoint to retrieve available timings for a doctor within a date range
router.get('/doctorAvailableTimings/:docId', async (req, res) => {
  const { docId } = req.params;
  const { startDate } = req.query;

  try {
    // Query the database for available timings for the specified doctor and date range
    const availableTimings = await AvailableTimings.find({
      doc_id: docId,
      startDate: { $gte: startDate },

    });

    res.status(200).json(availableTimings);
  } catch (error) {
    console.error('Error fetching available timings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.put('/updatedoctortimeslot/:docId', async (req, res) => {
  const { docId } = req.params;
  const { once, daily, weeks } = req.body;
  const weekly = weeks;

  try {
    let updatedDoctor;

    if (weekly) {
      const existingDoctor = await doctordetails.findById(docId);

      // Check if the provided time slot conflicts with existing slots for the same day
      const timeConflict = existingDoctor.weekly.some(item =>
        item.day === weekly.day &&
        item.timefrom === weekly.timefrom &&
        item.timetill === weekly.timetill
      );

      if (timeConflict) {
        return res.status(400).json({ message: 'Duplicate time slot for the same day' });
      }

      // Count the number of existing time slots for the provided day
      const existingSlotsForDay = existingDoctor.weekly.filter(item => item.day === weekly.day);
      const slotsCount = existingSlotsForDay.length;

      // Check if the number of slots exceeds the limit of 5
      if (slotsCount >= 5) {
        return res.status(400).json({ message: 'Maximum number of time slots reached for the day' });
      }

      // If no conflict and within the limit, append the new slot to the existing array
      updatedDoctor = await doctordetails.findByIdAndUpdate(
        docId,
        { $push: { weekly } },
        { new: true }
      );
    } else {
      // If weekly data is not provided, update other fields
      updatedDoctor = await doctordetails.findByIdAndUpdate(
        docId,
        { once, daily },
        { new: true }
      );
    }

    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating doctor data' });
  }
});

//reviews api

// 📌 POST API: Submit a Review
router.post("/reviews", async (req, res) => {
  try {
    const { doc_id, user_id, rating, comment } = req.body;

    console.log("Received Data:", req.body);

    // 🔍 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    // Convert doc_id to ObjectId
    const doctorObjectId = new mongoose.Types.ObjectId(doc_id);

    // 🔍 Check if doctor exists
    const doctorExists = await doctordetails.findById(doctorObjectId);
    if (!doctorExists) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // 📝 Create new review
    const newReview = new Review({
      doc_id: doctorObjectId,
      user_id: user_id, // Assuming user_id is already valid
      rating: rating,
      comment: comment,
    });

    // 🔄 Save review to database
    await newReview.save();

    res.json({ success: true, message: "Review submitted successfully!" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// 📋 GET API: Fetch Reviews for a Doctor
router.get("/reviews/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // 🛑 Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    // 🔍 Check if the doctor exists
    const doctorExists = await doctordetails.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // ✅ Fetch reviews and populate the reviewer's username
    const reviews = await Review.find({ doc_id: doctorId })
      .populate("user_id", "username") // Fetch reviewer's username
      .sort({ createdAt: -1 }) // Sort by latest reviews
      .lean(); // Converts to plain JS object for better performance

    // 🕒 Format the `createdAt` date & time for each review
    const formattedReviews = reviews.map((review) => ({
      ...review,
      date: new Date(review.createdAt).toLocaleDateString("en-US"), // Format: MM/DD/YYYY
      time: new Date(review.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }) // Format: HH:MM AM/PM
    }));

    res.status(200).json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/favourite", async (req, res) => {
  try {
    const { user_id, doctor_id } = req.body;

    // 🛑 Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(doctor_id)) {
      return res.status(400).json({ error: "Invalid User ID or Doctor ID format" });
    }

    // 🔍 Check if the doctor exists
    const doctorExists = await doctordetails.findById(doctor_id);
    if (!doctorExists) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // 🔍 Check if already favorited
    const alreadyFavorited = await Favourite.findOne({ user_id, doctor_id }); // ✅ Use correct model
    if (alreadyFavorited) {
      return res.status(400).json({ error: "Doctor is already in your favorites" });
    }

    // ✅ Add to favorites
    const newFavorite = new Favourite({ user_id, doctor_id });
    await newFavorite.save();

    res.status(201).json({ success: true, message: "Doctor added to favorites!" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/favourites/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // 🛑 Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }

    // 🔍 Fetch Favorite List and Populate Doctor Details
    const favorites = await Favourite.find({ user_id })
      .populate("doctor_id", "name specialization country state image") // ✅ Direct populate syntax
      .sort({ createdAt: -1 }); 

    if (!favorites.length) {
      return res.status(404).json({ error: "No favorite doctors found" });
    }

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

const pusher = new Pusher({
  appId: "1942966",
  key: "6cf3f5fa6543ea8f0041",
  secret: "a5bf621a962e5bed0109",
  cluster: "mt1",
  useTLS: true
});

router.post("/update-doctor-status", async (req, res) => {
  try {
    const { doctor_id, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(doctor_id)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    const statusBoolean = status === "online" || status === true;

    // ✅ Force update the status
    const updatedDoctor = await doctordetails.findByIdAndUpdate(
      doctor_id,
      { status: statusBoolean },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    console.log("Updated Doctor Status:", updatedDoctor.status); // Debug log

    // ✅ Trigger Pusher Event
    pusher.trigger("doctor-channel", "status-update", {
      doctor_id,
      status: statusBoolean
    });

    res.status(200).json({ success: true, message: `Doctor ${doctor_id} is now ${status}` });
  } catch (error) {
    console.error("Error updating doctor status:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});




router.get("/doctor-status/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    const doctor = await doctordetails.findById(doctorId);

    console.log("Doctor found in database:", doctor); // Debugging log

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Check if status is correctly retrieved
    console.log("Doctor Status:", doctor.status); // Debugging log

    const statusText = doctor.status ? "online" : "offline";

    res.status(200).json({ doctor_id: doctorId, status: statusText });
  } catch (error) {
    console.error("Error fetching doctor status:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


// Function to send email
app.use(express.json());

router.post("/google", async (req, res) => {
  try {
    console.log("📥 Full Request Body Received:", req.body); // Debug log

    const { name, email, sub, picture } = req.body; // Use sub instead of googleId

    if (!sub || typeof sub !== "string") {
      console.error("❌ Error: Missing or Invalid Google ID", sub);
      return res.status(400).json({ message: "Invalid Google ID", receivedData: req.body });
    }

    let user = await User.findOne({ googleId: sub }); // Check if user exists using sub as googleId

    if (!user) {
      user = new User({ name, email, googleId: sub, picture }); // Save sub as googleId
      await user.save();
      console.log("✅ New Google User Created:", user);
    } else {
      console.log("🔹 Existing Google User Logged In:", user);
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("❌ Error in Google Auth API:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});



//last seen

router.post("/doctor/update-last-seen/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { last_page } = req.body; // Example: "dashboard"

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    const lastSeenTime = new Date();

    const doctorStatus = await DoctorStatus.findOneAndUpdate(
      { doctor_id: doctorId }, // Find by doctor_id
      { 
        last_seen: lastSeenTime, 
        last_page: last_page || "Unknown" 
      },
      { new: true, upsert: true } // If not found, create new record
    );

    // Emit event via Pusher
    pusher.trigger("doctor-channel", "last-seen-updated", {
      doctor_id: doctorId,
      last_seen: lastSeenTime,
      last_page: last_page || "Unknown",
    });

    res.status(200).json({ 
      message: "Last seen updated", 
      last_seen: doctorStatus.last_seen, 
      last_page: doctorStatus.last_page 
    });

  } catch (error) {
    console.error("Error updating last seen:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ API to Get Doctor's Last Seen
// ✅ API to Get Doctor's Last Seen
router.get("/doctor/last-seen/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    const doctorStatus = await DoctorStatus.findOne(
      { doctor_id: doctorId }, 
      "last_seen last_page"
    );

    if (!doctorStatus) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ 
      last_seen: doctorStatus.last_seen, 
      last_page: doctorStatus.last_page 
    });

  } catch (error) {
    console.error("Error fetching last seen:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

//announments 



module.exports = router;
