const uuid = require('uuid');
const Article = require('../models/Article');
const Ticket = require('../models/Ticket');
const AgentSuggestion = require('../models/AgentSuggestion');
const AuditLog = require('../models/AuditLog');
const Config = require('../models/Config');
const dotenv = require('dotenv');
dotenv.config();

const STUB_MODE = process.env.STUB_MODE === 'true';

// Deterministic Stub Provider
const llmStub = {
  classify: (text) => {
    let category = 'other';
    let confidence = 0.5;
    if (text.includes('refund') || text.includes('invoice')) {
      category = 'billing';
      confidence = 0.9;
    } else if (text.includes('error') || text.includes('bug') || text.includes('stack')) {
      category = 'tech';
      confidence = 0.8;
    } else if (text.includes('delivery') || text.includes('shipment')) {
      category = 'shipping';
      confidence = 0.85;
    }
    return { predictedCategory: category, confidence };
  },
  draft: (text, articles) => {
    const draftReply = `Based on your query: ${text}. Here are references:\n` +
      articles.map((a, i) => `${i+1}. ${a.title} (ID: ${a._id})`).join('\n');
    return { draftReply, citations: articles.map(a => a._id) };
  }
};

// Agentic Workflow
async function triageTicket(ticketId) {
  const traceId = uuid.v4();
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  // Log start
  await logAudit(ticketId, traceId, 'system', 'TICKET_TRIAGED_STARTED', {});

  // Step 1: Classify
  const { predictedCategory, confidence } = llmStub.classify(ticket.description);
  await logAudit(ticketId, traceId, 'system', 'AGENT_CLASSIFIED', { category: predictedCategory, confidence });

  // Step 2: Retrieve KB (keyword search)
  const articles = await Article.find({
    $or: [
      { title: { $regex: predictedCategory, $options: 'i' } },
      { body: { $regex: predictedCategory, $options: 'i' } },
      { tags: predictedCategory }
    ],
    status: 'published'
  }).limit(3);
  await logAudit(ticketId, traceId, 'system', 'KB_RETRIEVED', { articleIds: articles.map(a => a._id) });

  // Step 3: Draft Reply
  const { draftReply, citations } = llmStub.draft(ticket.description, articles);
  await logAudit(ticketId, traceId, 'system', 'DRAFT_GENERATED', { draftReply, citations });

  // Step 4: Decision
  const config = await Config.findOne() || { autoCloseEnabled: true, confidenceThreshold: 0.78 };
  const suggestion = new AgentSuggestion({
    ticketId,
    predictedCategory,
    articleIds: citations,
    draftReply,
    confidence,
    autoClosed: false,
    modelInfo: { provider: 'stub', model: 'deterministic', promptVersion: '1.0', latencyMs: 100 }
  });
  await suggestion.save();

  if (config.autoCloseEnabled && confidence >= config.confidenceThreshold) {
    ticket.status = 'resolved';
    suggestion.autoClosed = true;
    await logAudit(ticketId, traceId, 'system', 'AUTO_CLOSED', { confidence });
  } else {
    ticket.status = 'waiting_human';
    ticket.assignee = null; // Assign to human later
    await logAudit(ticketId, traceId, 'system', 'ASSIGNED_TO_HUMAN', { confidence });
  }
  ticket.agentSuggestionId = suggestion._id;
  await ticket.save();

  // Log end
  await logAudit(ticketId, traceId, 'system', 'TICKET_TRIAGED_COMPLETED', {});
}

// Helper: Log Audit
async function logAudit(ticketId, traceId, actor, action, meta) {
  const log = new AuditLog({ ticketId, traceId, actor, action, meta });
  await log.save();
}

module.exports = { triageTicket };