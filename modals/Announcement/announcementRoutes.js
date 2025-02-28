const express = require("express");
const router = express.Router();
const Announcement = require("./Schema"); // Updated schema import
const Pusher = require("pusher");

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

/**
 * @route   POST /api/announcement
 * @desc    Create a new announcement
 * @access  Public
 */
router.post("/announcement", async (req, res) => {
  try {
    const { title, message, status } = req.body;

    const newAnnouncement = new Announcement({
      title,
      message,
      status: status || "active",
    });

    await newAnnouncement.save();

    // Send real-time announcement via Pusher
    pusher.trigger("announcements", "new-announcement", newAnnouncement);

    res.status(201).json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/announcement
 * @desc    Get all announcements
 * @access  Public
 */
router.get("/announcement", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/announcement/:id
 * @desc    Get a single announcement by ID
 * @access  Public
 */
router.get("/announcement/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/announcement/:id
 * @desc    Update an announcement
 * @access  Public
 */
router.put("/announcement/:id", async (req, res) => {
  try {
    const { title, message, status } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, status },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    // Send real-time update via Pusher
    pusher.trigger("announcements", "update-announcement", updatedAnnouncement);

    res.status(200).json({ success: true, announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/announcement/:id
 * @desc    Delete an announcement
 * @access  Public
 */
router.delete("/announcement/:id", async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    // Notify clients about deletion
    pusher.trigger("announcements", "delete-announcement", { id: req.params.id });

    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
