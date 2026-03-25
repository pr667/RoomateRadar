// models/Rating.js
const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  score: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 500 },
  tags: [{ type: String, enum: ['clean', 'responsive', 'honest', 'friendly', 'punctual'] }],
}, { timestamps: true });

RatingSchema.index({ rater: 1, ratee: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
