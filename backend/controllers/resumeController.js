const cloudinary = require("../utils/cloudinary");
const User = require("../models/User");

// ── POST /api/resume/upload ─────────────────────────────
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has a resume, delete the old one from Cloudinary
    if (user.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(user.resumePublicId, {
          resource_type: "raw",
        });
      } catch (err) {
        console.error("Error deleting old resume from Cloudinary:", err);
        // Continue anyway — don't block the new upload
      }
    }

    // Upload new resume to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "resumesync",
          public_id: `${user.username}-resume`,
          overwrite: true,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Update user's resume URL and public ID in MongoDB
    user.resumeUrl = result.secure_url;
    user.resumePublicId = result.public_id;
    await user.save();

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ message: "Failed to upload resume" });
  }
};
