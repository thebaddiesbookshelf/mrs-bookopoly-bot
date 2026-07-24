const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    senderId: {
      type: String,
      required: true,
      index: true,
    },

    recipientId: {
      type: String,
      required: true,
      index: true,
    },

    offeredProperty: {
      type: String,
      default: null,
    },

    requestedProperty: {
      type: String,
      default: null,
    },

    offeredBucks: {
      type: Number,
      default: 0,
      min: 0,
    },

    requestedBucks: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'accepted',
        'declined',
        'expired',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    channelId: {
      type: String,
      default: null,
    },

    messageId: {
      type: String,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tradeSchema.index({
  guildId: 1,
  status: 1,
  expiresAt: 1,
});

module.exports = mongoose.model('Trade', tradeSchema);

