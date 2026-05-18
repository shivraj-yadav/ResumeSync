const express = require("express");
const multer = require("multer");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadResume } = require("../controllers/resumeController");

// Multer config — store in memory buffer for direct Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// POST /api/resume/upload — protected, single PDF file
router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);

module.exports = router;
