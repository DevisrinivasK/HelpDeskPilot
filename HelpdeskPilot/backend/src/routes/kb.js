const express = require('express');
     const router = express.Router();
     const { authMiddleware, roleMiddleware } = require('../middleware/auth');
     const Article = require('../models/Article'); // Use Article model

     // Get KB articles (public)
     router.get('/', async (req, res) => {
       try {
         const { query } = req.query;
         const articles = await Article.find(
           query ? { $text: { $search: query } } : {}
         );
         res.json(articles);
       } catch (error) {
         res.status(500).json({ message: `Failed to fetch articles: ${error.message}` });
       }
     });

     // Create KB article (admin/agent only)
     router.post('/', authMiddleware, roleMiddleware(['admin', 'agent']), async (req, res) => {
       try {
         const article = new Article({
           title: req.body.title,
           body: req.body.body, // Align with Article.js schema
           tags: req.body.tags || [], // Required, provide empty array if not specified
           status: req.body.status || 'published' // Required, default to published
         });
         await article.save();
         res.status(201).json(article);
       } catch (error) {
         res.status(400).json({ message: `Failed to create article: ${error.message}` });
       }
     });

     module.exports = router;