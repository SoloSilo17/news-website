const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    publish_date: { type: Date, default: Date.now },
    image_url: { type: String, required: false },
});

module.exports = mongoose.model('Article', ArticleSchema);
