const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const router = express.Router();

// MongoDB Connection
const mongoURI = "your-mongodb-connection-string";
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
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// POST: Create an Article with Images
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, content, category, summary } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required." });
        }

        const serverUrl = req.protocol + "://" + req.get("host");
        const newArticle = new Article({
            title,
            content,
            category: category ? category.toLowerCase() : "general",
            summary,
            image_url: req.file ? `${serverUrl}/uploads/${req.file.filename}` : null,
        });

        await newArticle.save();
        res.status(201).json({ message: "Article created successfully!", article: newArticle });
    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

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
