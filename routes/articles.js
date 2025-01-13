const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const router = express.Router();

// MongoDB Connection
const mongoURI = "mongodb+srv://El-Inspector:7J1uQEPG5xnIKDl6@el-inspector.nmbr4.mongodb.net/noticion?retryWrites=true&w=majority&appName=El-Inspector";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

// Article Schema
const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: String,
    category: { type: String, required: true },
    publish_date: { type: Date, default: Date.now },
    image_url: String,
    additional_images: [String],
});

const Article = mongoose.model("Article", articleSchema);

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

// POST: Create an Article with Images
router.post(
    "/",
    upload.fields([
        { name: "image", maxCount: 1 }, // Single main image
        { name: "images", maxCount: 5 }, // Up to 5 additional images
    ]),
    async (req, res) => {
        try {
            const { title, content, category, summary, publish_date } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: "Title and content are required." });
            }

            const serverUrl = req.protocol + "://" + req.get("host");
            const newArticle = new Article({
                title,
                content,
                category: category || "General",
                summary: summary || "",
                publish_date: publish_date || new Date(),
                image_url: req.files["image"]
                    ? `${serverUrl}/uploads/${req.files["image"][0].filename}`
                    : null, // Full URL for main image
                additional_images: req.files["images"]
                    ? req.files["images"].map((file) => `${serverUrl}/uploads/${file.filename}`)
                    : [], // Full URLs for additional images
            });

            await newArticle.save();
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
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send("Error fetching articles");
    }
});

// GET: Retrieve Articles by Category
router.get("/:category", async (req, res) => {
    const category = req.params.category.toLowerCase();
    try {
        const articles = await Article.find({ category });
        res.json(articles);
    } catch (err) {
        console.error("Error fetching articles by category:", err);
        res.status(500).send("Error fetching articles by category");
    }
});

module.exports = router;
