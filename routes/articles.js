const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create directory if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
  },
});

const upload = multer({ storage });

// Simulated Database for Articles (replace with your database logic)
const articles = [];

// Endpoint: Create an Article with an Image
router.post("/", upload.single("image"), (req, res) => {
  try {
    const { title, content, category, summary, publish_date } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    // Save Article
    const newArticle = {
      id: articles.length + 1,
      title,
      content,
      category: category || "General",
      summary: summary || "",
      publish_date: publish_date || new Date().toISOString(),
      image_url: req.file ? `/uploads/${req.file.filename}` : null, // Save image URL
    };

    articles.push(newArticle); // Simulate database insertion
    res.status(201).json({ message: "Article created successfully!", article: newArticle });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export Router
module.exports = router;
