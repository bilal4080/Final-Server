const express = require("express");
const multer = require("multer");
const cloudinary = require("../../Config/cloudinary"); // Cloudinary config
const Document = require("../../modals/Document/Doc"); // Document schema
const mongoose = require("mongoose"); // Ensure it's imported

const router = express.Router();

// Multer setup (stores file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 📌 Upload API - Upload document with userId
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("🔥 API Hit: File Upload");

    const { userId, reportType } = req.body; // Extract reportType along with userId
    if (!userId) {
      console.log("⚠️ Missing User ID");
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!reportType) {
      console.log("⚠️ Missing Report Type");
      return res.status(400).json({ error: "Report type is required" });
    }

    if (!req.file) {
      console.log("⚠️ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📂 File received:", req.file.originalname);

    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "documents" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    console.log("✅ Cloudinary Upload Success:", result.secure_url);

    // Save file data to MongoDB, including the new reportType field
    const newDoc = new Document({
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: userId, // Store as a string ✅
      reportType: reportType // Save the reportType here
    });

    await newDoc.save();

    console.log("📄 Document saved in DB:", newDoc);

    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        _id: newDoc._id,
        fileName: newDoc.fileName,
        fileUrl: newDoc.fileUrl,
        publicId: newDoc.publicId,
        fileType: newDoc.fileType,
        fileSize: newDoc.fileSize,
        uploadedBy: newDoc.uploadedBy,
        reportType: newDoc.reportType, // Return reportType in the response
      },
    });
  } catch (error) {
    console.error("🚨 Upload Error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

/**
 * 📌 Get Uploaded Files by User ID
 */
router.get("/files/:userId", async (req, res) => {
  try {
    console.log("📦 API Hit: Get Files for User", req.params.userId);

    const files = await Document.find({ uploadedBy: req.params.userId });

    if (!files || files.length === 0) {
      return res.status(200).json({ files: [] });
    }

    console.log("📄 Files Retrieved:", files.length);

    // Return reportType as part of the file data
    res.status(200).json({ files });
  } catch (error) {
    console.error("🚨 Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

/**
 * 📌 Delete File API - Verifies user ID before deletion
 */
router.delete("/documents/:publicId/:userId", async (req, res) => {
  const publicId = req.params.publicId.trim();
  const userId = req.params.userId.trim();

  try {
      console.log("🗑️ API Hit: Delete File", { publicId, userId });

      // Try finding with and without "documents/"
      const file = await Document.findOne({
          $or: [
              { publicId: publicId, uploadedBy: userId },
              { publicId: `documents/${publicId}`, uploadedBy: userId }
          ]
      });

      if (!file) {
          console.log("❌ File not found in DB");
          return res.status(404).json({ error: "File not found" });
      }

      console.log("✅ File found in DB:", file);

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(file.publicId);
      console.log("☁️ Deleted from Cloudinary:", file.publicId);

      // Remove from MongoDB
      await Document.deleteOne({ _id: file._id });
      console.log("🗑️ Deleted from Database");

      return res.json({ message: "File deleted successfully" });
  } catch (error) {
      console.error("⚠️ Error deleting file:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
