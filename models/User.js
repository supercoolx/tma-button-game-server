const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { logger } = require('../helper/logger');

const UserSchema = new mongoose.Schema({
  tgId: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  username: {
    type: String,
    unique: true,
    required: [true, 'Please provide username'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: Date,
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  bonus_time: {
    type: Date,
    default: Date.now
  },
  jackpot: {
    type: Number,
    default: 0,
  },
  jointg: {
    type: Number,
    default: 0,
  },
  followx: {
    type: Number,
    default: 0,
  },
});

UserSchema.pre('save', async function () {
  // logger.info(this.modifiedPaths());
  // logger.info(this.isModified('name'));
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
