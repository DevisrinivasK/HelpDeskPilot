const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Article = require('../models/Article');
const Ticket = require('../models/Ticket');
const { triageTicket } = require('../services/agent');

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://mongo:27017/helpdeskpilot');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Ticket.deleteMany({});

    // Seed Users with hashed passwords
    const users = [
      { email: 'admin@example.com', password_hash: await bcrypt.hash('password1', 10), name: 'Admin User', role: 'admin' },
      { email: 'agent@example.com', password_hash: await bcrypt.hash('password2', 10), name: 'Agent User', role: 'agent' },
      { email: 'user@example.com', password_hash: await bcrypt.hash('password3', 10), name: 'Regular User', role: 'user' }
    ];
    const savedUsers = await User.insertMany(users);
    console.log('Users seeded:', savedUsers.length);

    // Seed Articles
    const articles = [
      { title: 'Billing FAQs', body: 'How to request a refund...', tags: ['billing'], status: 'published', createdBy: savedUsers[0]._id },
      { title: 'Troubleshooting Login Issues', body: 'If you see a 500 error...', tags: ['tech'], status: 'published', createdBy: savedUsers[0]._id },
      { title: 'Shipping Policies', body: 'Track your package...', tags: ['shipping'], status: 'published', createdBy: savedUsers[0]._id }
    ];
    const savedArticles = await Article.insertMany(articles);
    console.log('Articles seeded:', savedArticles.length);

    // Seed Tickets
    const tickets = [
      { title: 'Refund for double charge', description: 'Charged twice for order #1234', category: 'billing', createdBy: savedUsers[2]._id },
      { title: 'App shows 500 on login', description: 'Stack trace mentions auth module', category: 'tech', createdBy: savedUsers[2]._id },
      { title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'shipping', createdBy: savedUsers[2]._id }
    ];
    const savedTickets = await Ticket.insertMany(tickets);
    console.log('Tickets seeded:', savedTickets.length);

    // Triage each ticket
    for (const ticket of savedTickets) {
      await triageTicket(ticket._id);
      console.log(`Triaged ticket: ${ticket._id}`);
    }

    console.log('Database seeded successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();