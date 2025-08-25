const mongoose = require('mongoose');

const agentSuggestionSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  predictedCategory: { type: String, required: true },
  articleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  draftReply: { type: String, required: true },
  confidence: { type: Number, required: true },
  autoClosed: { type: Boolean, default: false },
  modelInfo: {
    provider: String,
    model: String,
    promptVersion: String,
    latencyMs: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentSuggestion', agentSuggestionSchema);