const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); // Import the Article model

// POST: Create an article
router.post('/', async (req, res) => {
    console.log('POST /api/articles called');
    console.log('Request Body:', req.body);

    const { title, summary, content, category, image_url, publish_date } = req.body;
    try {
        const newArticle = new Article({
            title,
            summary,
            content,
            category,
            image_url,
            publish_date,
        });
        await newArticle.save(); // Save the article to the database
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create article', details: err.message });
    }
});

// GET: Retrieve all articles
router.get('/', async (req, res) => {
    console.log('GET /api/articles called');
    try {
        const articles = await Article.find(); // Fetch all articles from the database
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
    }
});

// Export the router
module.exports = router;
