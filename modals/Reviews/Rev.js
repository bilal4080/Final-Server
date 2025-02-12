const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  doc_id: { type: mongoose.Schema.Types.ObjectId, ref: "DOCTORDETAILS", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
