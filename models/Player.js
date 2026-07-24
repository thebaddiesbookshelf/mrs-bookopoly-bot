const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    properties: {
      type: [String],
      default: [],
    },

    completedSets: {
      type: [String],
      default: [],
    },

    earnedSetBonuses: {
      type: [String],
      default: [],
    },

    getOutOfJailCards: {
      type: Number,
      default: 0,
      min: 0,
    },

    cardsDrawn: {
      type: Number,
      default: 0,
      min: 0,
},

    jailVisits: {
      type: Number,
      default: 0,
      min: 0,
},

    isInJail: {
      type: Boolean,
      default: false,
    },

    jailReason: {
      type: String,
      default: null,
    },

    jailBookedAt: {
      type: Date,
      default: null,
    },

    lastCardDraw: {
      type: Date,
      default: null,
    },
    
    lastPassGo: {
      type: Date,
      default: null,
    },

    booksLogged: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastBookLogged: {
      type: Date,
      default: null,
    },

lastReportAt: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

playerSchema.index(
  {
    guildId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Player', playerSchema);