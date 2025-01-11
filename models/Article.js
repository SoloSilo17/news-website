const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    image_url: { type: String },
    publish_date: { type: Date, default: Date.now },
    front_page: { type: Boolean, default: false }, // Add this field
});

module.exports = mongoose.model('Article', ArticleSchema);
