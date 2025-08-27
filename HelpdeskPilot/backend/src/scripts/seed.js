const mongoose = require('mongoose');
     const bcrypt = require('bcrypt');
     const User = require('../models/User');
     const Article = require('../models/Article'); // Use Article model
     const Ticket = require('../models/Ticket');
     const dotenv = require('dotenv');

     dotenv.config();

     const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/helpdeskpilot';

     async function seedData() {
       try {
         await mongoose.connect(mongoURI, {
           serverSelectionTimeoutMS: 5000,
           maxPoolSize: 10
         });
         console.log('Connected to MongoDB for seeding');

         // Clear existing data
         await User.deleteMany();
         await Article.deleteMany();
         await Ticket.deleteMany();

         // Seed Users
         const users = await User.insertMany([
           { name: 'Admin User', email: 'admin@example.com', password_hash: await bcrypt.hash('password1', 10), role: 'admin' },
           { name: 'Agent User', email: 'agent@example.com', password_hash: await bcrypt.hash('password2', 10), role: 'agent' },
           { name: 'Normal User', email: 'user@example.com', password_hash: await bcrypt.hash('password3', 10), role: 'user' }
         ]);
         console.log('Seeded users:', users.map(u => u.email));

         // Seed Articles (aligned with Article.js: body, required tags, status)
         const articles = await Article.insertMany([
           { title: 'How to update payment method', body: 'Update via settings...', tags: ['billing', 'payments'], status: 'published' },
           { title: 'Troubleshooting 500 errors', body: 'Check logs...', tags: ['tech', 'errors'], status: 'published' },
           { title: 'Tracking your shipment', body: 'Use tracking ID...', tags: ['shipping', 'delivery'], status: 'published' }
         ]);
         console.log('Seeded articles:', articles.map(a => a.title));

         // Seed Tickets
         const tickets = await Ticket.insertMany([
           { title: 'Refund for double charge', description: 'Charged twice for order #1234', category: 'billing', status: 'open', createdBy: users[2]._id },
           { title: 'App shows 500 on login', description: 'Stack trace mentions auth module', category: 'tech', status: 'open', createdBy: users[2]._id },
           { title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'shipping', status: 'open', createdBy: users[2]._id }
         ]);
         console.log('Seeded tickets:', tickets.map(t => t.title));

         console.log('Seed data inserted successfully');
       } catch (error) {
         console.error('Seed data insertion failed:', error.message, error.stack);
       } finally {
         await mongoose.disconnect();
         console.log('MongoDB connection closed');
       }
     }

     seedData();