const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); // Ensure the path to Article.js is correct

// Get all articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new article
router.post('/', async (req, res) => {
    const article = new Article(req.body);
    try {
        const savedArticle = await article.save();
        res.status(201).json(savedArticle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
