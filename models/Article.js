const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: String,
    category: { type: String, required: true },
    publish_date: { type: Date, default: Date.now },
    image_url: String,
});

module.exports = mongoose.model('Article', articleSchema);
