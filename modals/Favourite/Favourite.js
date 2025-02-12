const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "DOCTORDETAILS", required: true }, // Must match the model name
});

module.exports = mongoose.model("Favourite", favouriteSchema);
