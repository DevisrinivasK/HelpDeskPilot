const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for article
const articleSchema = Joi.object({
  title: Joi.string().required().min(3),
  body: Joi.string().required().min(10),
  tags: Joi.array().items(Joi.string()).required(),
  status: Joi.string().valid('draft', 'published').required()
});

// GET /api/kb?query=... (search, public)
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { body: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      };
    }
    const articles = await Article.find(filter);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles', error });
  }
});

// POST /api/kb (admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { error } = articleSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error creating article', error });
  }
});

// PUT /api/kb/:id (admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { error } = articleSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error updating article', error });
  }
});

// DELETE /api/kb/:id (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting article', error });
  }
});

module.exports = router;