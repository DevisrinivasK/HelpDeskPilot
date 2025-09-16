const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ticketRouter = require('../routes/ticket');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRouter);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('POST /api/tickets/:id/reply updates status for agent', async () => {
  const user = await User.create({ email: 'agent@example.com', password_hash: 'hash', role: 'agent' });
  const ticket = await mongoose.model('Ticket').create({
    title: 'Test',
    description: 'Test desc',
    category: 'billing',
    createdBy: user._id
  });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET);
  const res = await request(app)
    .post(`/api/tickets/${ticket._id}/reply`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'in_progress' });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('in_progress');
  const auditLog = await mongoose.model('AuditLog').findOne({ ticketId: ticket._id });
  expect(auditLog.action).toBe('Status updated to in_progress');
});