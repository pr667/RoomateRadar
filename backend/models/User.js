// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PreferencesSchema = new mongoose.Schema({
  food: { type: String, enum: ['veg', 'nonveg', 'vegan', 'any'], default: 'any' },
  sleep: { type: String, enum: ['early', 'late', 'flexible'], default: 'flexible' },
  smoking: { type: Boolean, default: false },
  drinking: { type: Boolean, default: false },
  pets: { type: Boolean, default: false },
  gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  cleanliness: { type: Number, min: 1, max: 5, default: 3 },
  noise: { type: String, enum: ['quiet', 'moderate', 'loud'], default: 'moderate' },
  workSchedule: { type: String, enum: ['wfh', 'office', 'hybrid'], default: 'office' },
  budgetMin: { type: Number, default: 0 },
  budgetMax: { type: Number, default: 50000 },
  preferredLocations: [{ type: String }],
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['seeker', 'host', 'admin'], default: 'seeker' },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 300 },
  phone: { type: String },
  preferences: { type: PreferencesSchema, default: () => ({}) },
  isProfileComplete: { type: Boolean, default: false },
  shortlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  trustScore: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Never send password in JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
