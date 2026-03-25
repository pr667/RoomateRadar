// models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  message: { type: String, maxlength: 500 },
  compatibilityScore: { type: Number },
}, { timestamps: true });

RequestSchema.index({ seeker: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Request', RequestSchema);
