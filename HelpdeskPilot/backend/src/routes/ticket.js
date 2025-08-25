const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const AgentSuggestion = require('../models/AgentSuggestion');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Joi = require('joi');
const { triageTicket } = require('../services/agent');

// Validation schema for ticket creation
const ticketSchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(10),
  category: Joi.string().valid('billing', 'tech', 'shipping', 'other').optional()
});

// Validation schema for reply
const replySchema = Joi.object({
  reply: Joi.string().required().min(5)
});

// GET /api/ticket (filter by status/my tickets) - authenticated
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { createdBy: req.user.id }; // Default to my tickets for users
    if (req.user.role === 'admin' || req.user.role === 'agent') {
      filter = {}; // Admins/agents see all
    }
    if (status) filter.status = status;
    const tickets = await Ticket.find(filter).populate('createdBy', 'name').populate('assignee', 'name');
    res.json(tickets);
  } catch (error) {
    console.error('Error in GET /api/ticket:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// GET /api/ticket/:id - authenticated
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name').populate('assignee', 'name').populate('agentSuggestionId');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin' && req.user.role !== 'agent' && ticket.createdBy._id.toString() !== req.user.id && (ticket.assignee && ticket.assignee._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error in GET /api/ticket/:id:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
});

// POST /api/ticket (user)
router.post('/', authMiddleware, roleMiddleware(['user']), async (req, res) => {
  try {
    const { error } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user.id,
      status: 'open',
      category: req.body.category || 'other'
    });
    await ticket.save();

    // Trigger triage
    triageTicket(ticket._id).catch(error => console.error('Triage failed', error));

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error in POST /api/ticket:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
});

// POST /api/ticket/:id/reply (agent)
router.post('/:id/reply', authMiddleware, roleMiddleware(['agent']), async (req, res) => {
  try {
    const { error } = replySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = req.body.status || 'resolved';
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error('Error in POST /api/ticket/:id/reply:', error.message, error.stack);
    res.status(500).json({ message: 'Error adding reply', error: error.message });
  }
});

// POST /api/ticket/:id/assign (admin/agent)
router.post('/:id/assign', authMiddleware, roleMiddleware(['admin', 'agent']), async (req, res) => {
  try {
    const { assigneeId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.assignee = assigneeId;
    ticket.status = 'triaged';
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error('Error in POST /api/ticket/:id/assign:', error.message, error.stack);
    res.status(500).json({ message: 'Error assigning ticket', error: error.message });
  }
});

// GET /api/ticket/:id/audit - authenticated (for testing)
router.get('/:id/audit', authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.find({ ticketId: req.params.id }).sort('timestamp');
    res.json(logs);
  } catch (error) {
    console.error('Error in GET /api/ticket/:id/audit:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

module.exports = router;