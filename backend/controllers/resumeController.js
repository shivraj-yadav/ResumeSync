const cloudinary = require("../utils/cloudinary");
const User = require("../models/User");

// ── Helper: build permanent versionless Cloudinary URL ──
const buildResumeUrl = (publicId) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;
};

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

    // Upload to Cloudinary with fixed public_id (overwrite + invalidate)
    // This ensures the same public_id is reused, so the URL never changes
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "resumesync",
          public_id: `${user.username}-resume`,
          overwrite: true,
          invalidate: true,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Store ONLY the public_id in MongoDB — URL is derived dynamically
    user.resumePublicId = result.public_id;
    await user.save();

    // Build the permanent versionless URL to return to the client
    const resumeUrl = buildResumeUrl(result.public_id);

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ message: "Failed to upload resume" });
  }
};

// Export helper for use in auth controller
exports.buildResumeUrl = buildResumeUrl;
