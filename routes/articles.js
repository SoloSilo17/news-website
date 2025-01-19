const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const sharp = require("sharp");

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
    summary: String, // Optional summary field
    category: { type: String, required: true },
    publish_date: { type: Date, default: Date.now },
    image_url: String, // Main image URL
    additional_images: [String], // Array of additional image URLs
});

const Article = mongoose.model("Article", articleSchema);

// API Key for Authentication
const API_KEY = "2a8070f1-b15b-4100-bec0-e56c3a144337";

// Middleware for API Key Authentication
const authenticate = (req, res, next) => {
    const key = req.headers["x-api-key"];
    if (key && key === API_KEY) {
        next();
    } else {
        res.status(403).json({ error: "Unauthorized access." });
    }
};

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

// POST: Create an Article with Images (Authenticated)
router.post(
    "/",
    authenticate,
    upload.fields([
        { name: "image", maxCount: 1 }, // Main image
        { name: "additional_images", maxCount: 10 }, // Up to 10 additional images
    ]),
    async (req, res) => {
        try {
            const { title, content, category, summary } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: "Title and content are required." });
            }

            const serverUrl = req.protocol + "://" + req.get("host");

            // Resize the main image if it exists
            let mainImageUrl = null;
            if (req.files["image"]) {
                const mainImage = req.files["image"][0];
                const resizedImagePath = `uploads/resized-${mainImage.filename}`;

                // Resize the image using Sharp
                await sharp(mainImage.path)
                    .resize(300, 300, {
                        fit: "inside", // Maintains aspect ratio
                    })
                    .toFile(resizedImagePath);

                // Update the main image URL
                mainImageUrl = `${serverUrl}/${resizedImagePath}`;
            }

            const newArticle = new Article({
                title,
                content,
                category: category ? category.toLowerCase() : "general",
                summary: summary || content.slice(0, 100) + "...", // Use summary or truncate content
                image_url: mainImageUrl, // Resized main image URL
                additional_images: req.files["additional_images"]
                    ? req.files["additional_images"].map((file) => `${serverUrl}/uploads/${file.filename}`)
                    : [], // Array of additional image URLs
            });

            await newArticle.save();
            res.status(201).json({ message: "Article created successfully!", article: newArticle });
        } catch (error) {
            console.error("Error processing request:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

// GET: Retrieve All Articles
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find().sort({ publish_date: -1 }); // Sort by latest date
        res.json(
            articles.map((article) => ({
                ...article.toObject(),
                formatted_date: article.publish_date
                    ? new Date(article.publish_date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/New_York", // Use US Eastern Time
                    })
                    : null, // Handle missing date
            }))
        );
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send("Error fetching articles");
    }
});

// GET: Retrieve Articles by Category
router.get("/:category", async (req, res) => {
    const category = req.params.category.toLowerCase();
    try {
        const articles = await Article.find({ category }).sort({ publish_date: -1 }); // Sort by latest date
        res.json(
            articles.map((article) => ({
                ...article.toObject(),
                formatted_date: article.publish_date
                    ? new Date(article.publish_date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/New_York", // Use US Eastern Time
                    })
                    : null, // Handle missing date
            }))
        );
    } catch (err) {
        console.error("Error fetching articles by category:", err);
        res.status(500).send("Error fetching articles by category");
    }
});

module.exports = router;
