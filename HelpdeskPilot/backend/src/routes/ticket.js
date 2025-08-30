const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

// Create a ticket (any authenticated user)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, category } = req.body;
  try {
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }
    if (!req.user?.id || !req.user?.email) {
      console.error('Invalid user data in authMiddleware:', req.user);
      return res.status(401).json({ message: 'Invalid authentication data' });
    }
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
    // Create audit log
    await AuditLog.create({
      ticketId: ticket._id,
      traceId: uuidv4(),
      action: `Ticket created: ${title}`,
      actor: req.user.email,
      meta: {}
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: `Failed to create ticket: ${error.message}` });
  }
});

// Get all tickets (admin/agent see all, users see their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id || !req.user?.role) {
      console.error('Invalid user data in authMiddleware:', req.user);
      return res.status(401).json({ message: 'Invalid authentication data' });
    }
    let tickets;
    if (req.user.role === 'user') {
      tickets = await Ticket.find({ createdBy: req.user.id }).populate('createdBy', 'email name');
    } else if (['admin', 'agent'].includes(req.user.role)) {
      tickets = await Ticket.find().populate('createdBy', 'email name');
    } else {
      return res.status(403).json({ message: 'Not authorized to view tickets' });
    }
    res.json(tickets || []);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: `Failed to fetch tickets: ${error.message}` });
  }
});

// Get ticket by ID (user-specific or admin/agent)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }
    if (!req.user?.id) {
      console.error('Invalid user data in authMiddleware:', req.user);
      return res.status(401).json({ message: 'Invalid authentication data' });
    }
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'email name');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.createdBy._id.toString() !== req.user.id && !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: `Failed to fetch ticket: ${error.message}` });
  }
});

// Get audit logs (admin/agent or user for own ticket)
router.get('/:id/audit', authMiddleware, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }
    if (!req.user?.id) {
      console.error('Invalid user data in authMiddleware:', req.user);
      return res.status(401).json({ message: 'Invalid authentication data' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.createdBy.toString() !== req.user.id && !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view audit logs' });
    }
    const auditLogs = await AuditLog.find({ ticketId: req.params.id });
    res.json(auditLogs || []);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: `Failed to fetch audit logs: ${error.message}` });
  }
});

// Reply to ticket or update status (agent/admin only)
router.post('/:id/reply', authMiddleware, roleMiddleware(['agent', 'admin']), async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }
    if (!req.user?.id || !req.user?.email) {
      console.error('Invalid user data in authMiddleware:', req.user);
      return res.status(401).json({ message: 'Invalid authentication data' });
    }
    const { reply, status } = req.body;
    console.log('Received reply/status update:', { ticketId: req.params.id, reply, status });
    if (!reply && !status) {
      return res.status(400).json({ message: 'Reply or status update required' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.replies = ticket.replies || [];
    if (reply) {
      ticket.replies.push({ content: reply, author: req.user.id });
    }
    if (status) {
      ticket.status = status;
    }
    await ticket.save();
    await AuditLog.create({
      ticketId: req.params.id,
      traceId: uuidv4(),
      action: reply ? `Replied: ${reply}` : `Status updated to ${status}`,
      actor: req.user.email,
      meta: {}
    });
    const updatedTicket = await Ticket.findById(req.params.id).populate('createdBy', 'email name');
    // Emit Socket.IO event
    const io = req.app.get('socketio');
    io.emit('ticketUpdated', updatedTicket);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Error posting reply/status update:', error);
    res.status(500).json({ message: `Failed to reply to ticket: ${error.message}` });
  }
});

module.exports = router;