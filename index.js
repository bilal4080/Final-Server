const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require("./modals/Logins/UserLogin")
const connection = require("./db");
const userRoutes = require('./Routes/RouteLogins/User')
const uploadRoute =require('./modals/Upload/UpoadDoc')
const paymentRoutes = require("./Payment/paymentRoutes.js");
const announcementRoutes = require("./modals/Announcement/announcementRoutes.js"); 
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

connection();
app.use("/api", uploadRoute);
app.use("/payment",paymentRoutes);
app.use("/api",announcementRoutes);
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
