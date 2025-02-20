const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  reportType:String,
  fileName: String,
  fileUrl: String,
  publicId: String,
  fileType: String,
  fileSize: Number,
  uploadedBy: String, // Or mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;  // <-- Ensure it's exported properly
