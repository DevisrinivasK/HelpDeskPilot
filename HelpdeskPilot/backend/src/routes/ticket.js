const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

// Validation schema for ticket
const ticketSchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(10),
  category: Joi.string().valid('billing', 'tech', 'shipping', 'other').required(),
  status: Joi.string().valid('open', 'triaged', 'waiting_human', 'resolved', 'closed').required()
});

// Create audit log helper
const logAction = async (ticketId, actor, action, meta = {}) => {
  await AuditLog.create({
    ticketId,
    traceId: uuidv4(),
    actor,
    action,
    meta,
    timestamp: new Date()
  });
};

// POST /api/ticket (authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /api/ticket called', { user: req.user, body: req.body });
    const { error } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user.id,
      status: 'open' // Force initial status
    });
    await ticket.save();
    console.log('Ticket saved', { ticketId: ticket._id });
    await logAction(ticket._id, 'user', 'created', { userId: req.user.id });
    console.log('Audit log created');
    res.status(201).json(ticket);
  } catch (error) {
    console.error('POST /api/ticket error:', error);
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
});

// GET /api/ticket (all authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email');
    res.json(tickets);
  } catch (error) {
    console.error('GET /api/ticket error:', error);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// GET /api/ticket/:id (all authenticated users)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    console.error('GET /api/ticket/:id error:', error);
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
});

// PUT /api/ticket/:id (admin or agent only)
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'agent']), async (req, res) => {
  try {
    console.log('PUT /api/ticket/:id called', { user: req.user, body: req.body });
    const { error } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    await logAction(ticket._id, req.user.role, 'updated', { userId: req.user.id, changes: req.body });
    res.json(ticket);
  } catch (error) {
    console.error('PUT /api/ticket/:id error:', error);
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
});

// DELETE /api/ticket/:id (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    console.log('DELETE /api/ticket/:id called', { user: req.user });
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    await logAction(ticket._id, 'admin', 'deleted', { userId: req.user.id });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    console.error('DELETE /api/ticket/:id error:', error);
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
});

module.exports = router;