const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// Create a ticket (any authenticated user)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const ticket = new Ticket({
      title,
      description,
      category,
      createdBy: req.user.id
    });
    await ticket.save();
    // Trigger AI triage
    const { triageTicket } = require('../services/agent');
    await triageTicket(ticket._id);
    // Emit Socket.IO event
    const io = req.app.get('socketio');
    io.emit('ticketCreated', ticket);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: `Failed to create ticket: ${error.message}` });
  }
});

// Get all tickets (admin/agent only)
router.get('/', authMiddleware, roleMiddleware(['admin', 'agent']), async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('createdBy', 'email name');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch tickets: ${error.message}` });
  }
});

// Get ticket by ID (user-specific or admin/agent)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'email name');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.createdBy._id.toString() !== req.user.id && !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch ticket: ${error.message}` });
  }
});

// Get audit logs (admin/agent only)
router.get('/:id/audit', authMiddleware, roleMiddleware(['admin', 'agent']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('auditLogs');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket.auditLogs || []);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch audit logs: ${error.message}` });
  }
});

// Reply to ticket (agent/admin only)
router.post('/:id/reply', authMiddleware, roleMiddleware(['agent', 'admin']), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: req.body }, status: req.body.status },
      { new: true }
    ).populate('createdBy', 'email name');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    // Emit Socket.IO event
    const io = req.app.get('socketio');
    io.emit('ticketUpdated', ticket);
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: `Failed to reply to ticket: ${error.message}` });
  }
});

module.exports = router;