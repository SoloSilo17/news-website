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

// Multer Middleware
const upload = multer({ storage });

// Simulated Database for Articles
const articles = []; // Replace with your database logic if needed

// POST: Create an Article with Images
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 }, // Single main image
    { name: "images", maxCount: 5 }, // Up to 5 additional images
  ]),
  (req, res) => {
    try {
      console.log("Request Body:", req.body);
      console.log("Uploaded Files:", req.files);

      const { title, content, category, summary, publish_date } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
      }

      const newArticle = {
        id: articles.length + 1,
        title,
        content,
        category: category || "General",
        summary: summary || "",
        publish_date: publish_date || new Date().toISOString(),
        image_url: req.files["image"]
          ? `/uploads/${req.files["image"][0].filename}`
          : null, // Main image URL
        additional_images: req.files["images"]
          ? req.files["images"].map((file) => `/uploads/${file.filename}`)
          : [], // Additional image URLs
      };

      articles.push(newArticle);
      res.status(201).json({
        message: "Article created successfully!",
        article: newArticle,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// GET: Retrieve All Articles
router.get("/", (req, res) => {
  console.log("GET /api/articles called");
  res.json(articles);
});

module.exports = router;
