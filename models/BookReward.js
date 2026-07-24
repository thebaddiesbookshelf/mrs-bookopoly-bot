const mongoose = require('mongoose');

const BookRewardSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
  },

  guildId: {
    type: String,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },

  pages: {
    type: Number,
    required: true,
  },

  format: {
    type: String,
    default: 'Novel',
  },

  reward: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'BookReward',
  BookRewardSchema
);