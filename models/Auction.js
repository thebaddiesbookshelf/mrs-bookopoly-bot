const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const auctionSchema = new mongoose.Schema(
  {
    guildId: {
  type: String,
  required: true,
},

    channelId: {
      type: String,
      required: true,
    },

    messageId: {
      type: String,
      default: null,
    },

    propertyId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'active',
        'processing',
        'completed',
        'cancelled',
        'expired',
      ],
      default: 'active',
      index: true,
    },

    highestBid: {
      type: Number,
      default: 0,
      min: 0,
    },

    highestBidderId: {
      type: String,
      default: null,
    },

    highestBidderUsername: {
      type: String,
      default: null,
    },

    bids: {
      type: [bidSchema],
      default: [],
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endsAt: {
      type: Date,
      required: true,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    winnerId: {
      type: String,
      default: null,
    },

    winnerUsername: {
      type: String,
      default: null,
    },

    winningBid: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| ONE ACTIVE AUCTION PER SERVER
|--------------------------------------------------------------------------
|
| MongoDB only applies this unique index to documents whose status is active.
| Completed and cancelled auctions remain in the database for history.
|
*/

auctionSchema.index(
  {
    guildId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: 'active',
    },
  }
);

module.exports = mongoose.model('Auction', auctionSchema);