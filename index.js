const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require("./modals/Logins/UserLogin")
const connection = require("./db");
const userRoutes = require('./Routes/RouteLogins/User')

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use('/api', userRoutes);
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require("body-parser");
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

const server = http.Server(app);
const io = socketIo(server, {
  cors: corsOptions // Apply CORS options to the Socket.IO server
});

// Store user ID along with socket ID
const userIdToSocketId = {};
const docIdToSocketId = {};

// Define socket event handlers
io.on('connection', (socket) => {
  console.log('A user connected');
  // Store user ID along with socket ID
  socket.on('storeSocketId', ({ userId }) => {
    userIdToSocketId[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });
  // socket.on('OnlineDoctorStatus', ({ docId }) => {
  //   docIdToSocketId[docId] = docId;
  //   io.emit('DoctorisOnline', { docId: docId });
  //   console.log(`Doctor ${docId} is online`);
  // });
  // socket.on("doctorJoinRoom", (doctorId, userId) => {
  //   // Notify patient that the doctor is online
  //   io.emit("doctorOnlineNotification", `Your doctor ${doctorId}`);
  // });


  // Handle call request from buyer to seller
  socket.on('callRequestFromBuyer', ({ buyerId, sellerId }) => {
    // Find the socket ID of the seller using their user ID
    const sellerSocketId = userIdToSocketId[sellerId];
    if (sellerSocketId) {
      // Emit call request to seller
      console.log("callRequestFromBuyer");
      console.log("buyerId", buyerId);
      console.log("sellerId", sellerId);
      io.to(sellerSocketId).emit('incomingCallFromBuyer', { callerId: buyerId });
    } else {
      console.log(`Seller with ID ${sellerId} is not connected.`);
    }
  });
  // Handle call request from seller to buyer
  socket.on('callRequestFromSeller', ({ buyerId, sellerId }) => {
    // Find the socket ID of the seller using their user ID
    const sellerSocketId = userIdToSocketId[buyerId];
    if (sellerSocketId) {
      // Emit call request to buyer
      console.log("callRequestFromSeller");
      console.log("buyerId", buyerId);
      console.log("sellerId", sellerId);
      io.to(sellerSocketId).emit('incomingCallFromSeller', { callerId: sellerId });
    } else {
      console.log(`Buyer with ID ${buyerId} is not connected.`);
    }
  });

  // Handle call acceptance
  socket.on('acceptCall', ({ callerId }) => {
    // Emit call acceptance to buyer
    const callerSocketId = userIdToSocketId[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('callAccepted');
    } else {
      console.log(`Caller with ID ${callerId} is not connected.`);
    }
  });

  // Handle reject call
  socket.on('rejectCall', ({ callerId }) => {
    // Emit call rejection to the caller
    const callerSocketId = userIdToSocketId[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('callRejected');
    } else {
      console.log(`Caller with ID ${callerId} is not connected.`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove the disconnected user from the mapping
    for (const [userId, id] of Object.entries(userIdToSocketId)) {
      if (id === socket.id) {
        delete userIdToSocketId[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});
// Attach Socket.IO to the HTTP server
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// Connect to MongoDB
connection();
// app.get('/', function (req, res) {
//   res.sendfile('index.html');
// });





// io.on('connection', function (socket) {
//   console.log("New client connected");

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });

//   // Handle doctor joining room
//   socket.on("doctorJoinRoom", (doctorId, userId) => {
//     console.log(`Doctor ${doctorId} joined room for user ${userId}`);
//     // Notify patient that the doctor is online
//     io.emit("doctorOnlineNotification", `Your doctor ${doctorId}`);
//   });
//   socket.on("patientrejectcall", (roomId, userId) => {
//     console.log(`Doctor ${roomId} joined room for user ${userId}`);
//     // Notify patient that the doctor is online
//     io.emit("patientnotAvaible", `Your Patient Reject the call`);
//   });
// });

// // Store user ID along with socket ID
// const userIdToSocketId = {};
// const userToSocketMap = new Map();
// // Define socket event handlers
// io.on('connection', (socket) => {


//   console.log('A user connected');
//   // Store user ID along with socket ID
//   socket.on('storeSocketId', ({ ID }) => {
//     // const userId = socket.handshake.query.userId; 
//     userToSocketMap.set(ID, socket.id);
//     // userIdToSocketId[ID] = socket.id;
//     console.log(`User ${ID} connected with socket ID ${socket.id}`);
//   });

//   // Handle call request from seller to buyer
//   // socket.on('callRequestFromDoctor', (docId, userId) => {
//   //   console.log("docId", docId, "userId", userId);
//   //   // Find the socket ID of the seller using their user ID
//   //   const sellerSocketId = userToSocketMap.get(userId);
//   //   if (sellerSocketId) {
//   //     // Emit call request to buyer
//   //     console.log("callRequestFromDoctor", sellerSocketId);
//   //     console.log("PatientId", userId);
//   //     console.log("DoctorId", docId);
//   //     // io.to(sellerSocketId).emit('incomingCallFromDoctor', `Your doctor ${docId}`);
//   //     io.emit('incomingCallFromDoctor', `Your doctor ${docId}`);
//   //   } else {
//   //     console.log(`Patient with ID ${userId} is not connected.`);
//   //   }
//   // });


//   // Handle doctor joining room
//   // socket.on("doctorJoinRoom", (docId, userId) => {
//   //   console.log(`Doctor ${docId} joined room for user ${userId}`);
//   //   const sellerSocketId = userToSocketMap.get(userId);
//   //   console.log("sellerSocketId",sellerSocketId);
//   //   io.to(sellerSocketId).emit("doctorOnlineNotification", `Your doctor ${docId}`)
//   //   // Notify patient that the doctor is online
//   //   // io.emit("doctorOnlineNotification", `Your doctor ${docId}`);
//   // });
//   // Handle doctor joining room
//   socket.on("doctorJoinRoom", (docId, userId) => {
//     console.log(`Doctor ${docId} joined room for user ${userId}`);
//     const patientSocketId = userToSocketMap.get(userId);
//     console.log("Patient socket ID:", patientSocketId); // Log patient's socket ID
//     if (patientSocketId) {
//       // io.sockets.socket(patientSocketId).emit('doctorOnlineNotification', 'Your doctor ${docId}');
//       // // socket.broadcast.to(patientSocketId).emit('doctorOnlineNotification', 'for your eyes only');

//       io.to(patientSocketId).emit("doctorOnlineNotification", `Your doctor ${docId}`);
//       // io.emit("doctorOnlineNotification", `Your doctor ${docId}`);
//       console.log("Notification sent to patient");
//     } else {
//       console.log(`Patient with ID ${userId} is not connected.`);
//     }
//   });


//   socket.on("patientrejectcall", (roomId, userId) => {
//     console.log(`Doctor ${roomId} joined room for user ${userId}`);
//     // Notify patient that the doctor is online
//     io.emit("patientnotAvaible", `Your Patient Reject the call`);
//   });

//   // Handle call request from buyer to seller
//   socket.on('callRequestFromPatient', ({ userId, doctorId }) => {

//     // Find the socket ID of the seller using their user ID
//     const sellerSocketId = userIdToSocketId[doctorId];
//     if (sellerSocketId) {
//       // Emit call request to seller
//       console.log("callRequestFromBuyer");
//       console.log("buyerId", userId);
//       console.log("sellerId", doctorId);
//       io.to(sellerSocketId).emit('incomingCallFromBuyer', { callerId: userId });
//     } else {
//       console.log(`Seller with ID ${doctorId} is not connected.`);
//     }
//   });


//   // Handle call acceptance
//   socket.on('acceptCall', ({ callerId }) => {
//     // Emit call acceptance to buyer
//     const callerSocketId = userIdToSocketId[callerId];
//     if (callerSocketId) {
//       io.to(callerSocketId).emit('callAccepted');
//     } else {
//       console.log(`Caller with ID ${callerId} is not connected.`);
//     }
//   });

//   // Handle reject call
//   socket.on('rejectCall', ({ callerId }) => {
//     // Emit call rejection to the caller
//     const callerSocketId = userIdToSocketId[callerId];
//     if (callerSocketId) {
//       io.to(callerSocketId).emit('callRejected');
//     } else {
//       console.log(`Caller with ID ${callerId} is not connected.`);
//     }
//   });

//   // Handle disconnect
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//     // Remove the disconnected user from the mapping
//     for (const [userId, id] of Object.entries(userIdToSocketId)) {
//       if (id === socket.id) {
//         delete userIdToSocketId[userId];
//         console.log(`User ${userId} disconnected`);
//         break;
//       }
//     }
//   });
// });
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
