const mongoose = require('mongoose');

const investigationSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
    },

    caseNumber: {
      type: Number,
      required: true,
    },

    suspectId: {
      type: String,
      required: true,
    },

    suspectUsername: {
      type: String,
      required: true,
    },

    investorId: {
      type: String,
      required: true,
    },

    investorUsername: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['open', 'dismissed', 'guilty'],
      default: 'open',
    },

    openedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    defenseSubmitted: {
      type: Boolean,
      default: false,
    },

    defenseText: {
      type: String,
      default: null,
      trim: true,
    },

    defenseSubmittedAt: {
      type: Date,
      default: null,
    },

    messageId: {
      type: String,
      default: null,
    },

    channelId: {
      type: String,
      required: true,
    },

    verdictIssuedAt: {
      type: Date,
      default: null,
    },

    dismissalChance: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    verdictRoll: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

investigationSchema.index(
  {
    guildId: 1,
    caseNumber: 1,
  },
  {
    unique: true,
  }
);

investigationSchema.index({
  guildId: 1,
  suspectId: 1,
  status: 1,
});

investigationSchema.index({
  status: 1,
  expiresAt: 1,
});

module.exports = mongoose.model(
  'Investigation',
  investigationSchema
);