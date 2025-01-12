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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Unsupported file type!"));
    }
  },
});

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
      const { title, content, category, summary, publish_date } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
      }

      const serverUrl = req.protocol + "://" + req.get("host");
      const newArticle = {
        id: articles.length + 1,
        title,
        content,
        category: category || "General",
        summary: summary || "",
        publish_date: publish_date || new Date().toISOString(),
        image_url: req.files["image"]
          ? `${serverUrl}/uploads/${req.files["image"][0].filename}`
          : null, // Full URL for main image
        additional_images: req.files["images"]
          ? req.files["images"].map((file) => `${serverUrl}/uploads/${file.filename}`)
          : [], // Full URLs for additional images
      };

      articles.push(newArticle);
      res.status(201).json({
        message: "Article created successfully!",
        article: newArticle,
      });
    } catch (error) {
      console.error("Error processing request:", error.message);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
);

// GET: Retrieve All Articles
router.get("/", (req, res) => {
  res.json(articles);
});

// GET: Retrieve Articles by Category
router.get("/:category", (req, res) => {
  const category = req.params.category;
  const filteredArticles = articles.filter((article) => article.category.toLowerCase() === category.toLowerCase());
  res.json(filteredArticles);
});

module.exports = router;
