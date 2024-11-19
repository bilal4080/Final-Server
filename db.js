const mongoose = require("mongoose");
require('dotenv').config();
const databaseUrl = process.env.MONGODB_URI;
module.exports = async () => {
  try {
    const connectionParams = {
      useNewUrlParser: true,
      //   useCreateIndex: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(

      // "mongodb+srv://mohammadikram20001:MBNX3JFwhnwZ77hB@cluster0.s6ypc1x.mongodb.net/IMDFX",
      databaseUrl,
      connectionParams
    );
    console.log("Connected to database");
  } catch (error) {
    console.log("Could not connect to database.", error);
  }
};
// MongoDB connection
// mongoose.connect('mongodb+srv://wajeehkaz:PFh4d4hhP24TieH@cluster0.s6ypc1x.mongodb.net/imdfx', { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });