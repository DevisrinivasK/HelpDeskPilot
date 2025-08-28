const mongoose = require('mongoose');

     const ticketSchema = new mongoose.Schema({
       title: { type: String, required: true },
       description: { type: String, required: true },
       category: { type: String, enum: ['billing', 'tech', 'shipping', 'other'], default: 'other' },
       status: { type: String, enum: ['open', 'in-progress', 'closed', 'waiting_human', 'resolved'], default: 'open' },
       createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
       createdAt: { type: Date, default: Date.now },
       agentSuggestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentSuggestion' },
       auditLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog' }]
     });

     module.exports = mongoose.model('Ticket', ticketSchema);