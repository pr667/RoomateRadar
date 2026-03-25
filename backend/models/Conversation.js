// models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  isUnlocked: { type: Boolean, default: false },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
