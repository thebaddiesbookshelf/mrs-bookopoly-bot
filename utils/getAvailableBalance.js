const Player = require('../models/Player');
const Trade = require('../models/Trade');
const Auction = require('../models/Auction');

/*
|--------------------------------------------------------------------------
| GET A PLAYER'S SPENDABLE BALANCE
|--------------------------------------------------------------------------
|
| Spendable BB =
| Player Balance
| - Pending Trade Reservations
| - Active Auction Reservation (if currently highest bidder)
|
*/

async function getAvailableBalance(guildId, userId) {
  const player = await Player.findOne({
    guildId,
    userId,
  });

  if (!player) {
    return {
      balance: 0,
      reservedTrades: 0,
      reservedAuction: 0,
      available: 0,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Reserved by pending trades
  |--------------------------------------------------------------------------
  */

  const pendingTrades = await Trade.find({
    guildId,
    status: 'pending',
    expiresAt: {
      $gt: new Date(),
    },
    $or: [
      {
        senderId: userId,
      },
      {
        recipientId: userId,
      },
    ],
  }).lean();

  let reservedTrades = 0;

  for (const trade of pendingTrades) {
    if (trade.senderId === userId) {
      reservedTrades += trade.offeredBucks ?? 0;
    }

    if (trade.recipientId === userId) {
      reservedTrades += trade.requestedBucks ?? 0;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Reserved by active auction
  |--------------------------------------------------------------------------
  */

  const activeAuction = await Auction.findOne({
    guildId,
    status: 'active',
    highestBidderId: userId,
  }).lean();

  const reservedAuction =
    activeAuction?.highestBid ?? 0;

  /*
  |--------------------------------------------------------------------------
  | Final spendable amount
  |--------------------------------------------------------------------------
  */

  const available =
    player.balance -
    reservedTrades -
    reservedAuction;

  return {
    balance: player.balance,
    reservedTrades,
    reservedAuction,
    available: Math.max(available, 0),
  };
}

module.exports = getAvailableBalance;