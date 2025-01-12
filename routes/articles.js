const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); // Import the Article model

// POST: Create an article
router.post('/', async (req, res) => {
    console.log('POST /api/articles called');
    console.log('Request Body:', req.body);

    const { title, summary, content, category, image_url, publish_date, front_page } = req.body;

    router.post('/', async (req, res) => {
        const { title, summary, content, category, image_url, publish_date, front_page } = req.body;
        try {
            const newArticle = new Article({
                title,
                summary,
                content,
                category,
                image_url,
                publish_date,
                front_page: front_page || false,
            });
            await newArticle.save();
            res.status(201).json(newArticle);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create article', details: err.message });
        }
    });    


    // Validation for required fields
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required!' });
    }

    try {
        const newArticle = new Article({
            title,
            summary,
            content,
            category,
            image_url,
            publish_date,
            front_page: front_page || false, // Default to false if not provided
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
        const { page = 1, limit = 10 } = req.query; // Default pagination values
        const articles = await Article.find()
            .sort({ publish_date: -1 }) // Sort by most recent
            .limit(limit * 1) // Convert limit to number
            .skip((page - 1) * limit); // Skip items for previous pages

        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
    }
});

// GET: Retrieve front-page articles
router.get('/front-page', async (req, res) => {
    try {
        const frontPageArticles = await Article.find({ front_page: true });
        res.json(frontPageArticles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch front-page articles' });
    }
});



router.put('/:id', async (req, res) => {
    try {
        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Returns the updated document
        );
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update article', details: error.message });
    }
});

// DELETE: Remove an article by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        if (!deletedArticle) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete article', details: error.message });
    }
});



// Export the router
module.exports = router;
