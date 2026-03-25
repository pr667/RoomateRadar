// models/Listing.js
const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    pincode: String,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  rent: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  roomType: { type: String, enum: ['private', 'shared', 'studio', 'pg'], required: true },
  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'parking', 'gym', 'laundry', 'kitchen', 'balcony', 'furnished', 'security']
  }],
  photos: [{ type: String }],
  availableFrom: { type: Date },
  preferredGender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  smokingAllowed: { type: Boolean, default: false },
  petsAllowed: { type: Boolean, default: false },
  maxRoommates: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

ListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', ListingSchema);
