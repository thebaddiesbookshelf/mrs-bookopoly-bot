const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const mongoose = require('mongoose');

const Player = require('../models/Player');
const Trade = require('../models/Trade');

const {
  properties,
  getPropertyById,
} = require('../data/properties');

/*
|--------------------------------------------------------------------------
| PROPERTY HELPERS
|--------------------------------------------------------------------------
*/

function getPropertyId(property) {
  return property?.id ?? property?.propertyId ?? null;
}

function getPropertyName(propertyId) {
  if (!propertyId) {
    return null;
  }

  const property = getPropertyById(propertyId);

  if (!property) {
    return propertyId;
  }

  return property.name ?? property.title ?? propertyId;
}

function getPropertyEmoji(propertyId) {
  if (!propertyId) {
    return '🏡';
  }

  const property = getPropertyById(propertyId);

  return property?.setEmoji ?? property?.emoji ?? '🏡';
}

function getCollectionKey(property) {
  return (
    property?.setId ??
    property?.collectionId ??
    property?.setName ??
    property?.collectionName ??
    null
  );
}

function getCollectionDisplayName(property) {
  return (
    property?.setDisplayName ??
    property?.setName ??
    property?.collectionName ??
    getCollectionKey(property)
  );
}

/*
|--------------------------------------------------------------------------
| COLLECTION RECALCULATION
|--------------------------------------------------------------------------
|
| This rebuilds completedSets after a trade.
|
| It groups all properties by their collection and checks whether the player
| owns every property in that collection.
|
*/

function calculateCompletedSets(ownedPropertyIds = []) {
  const owned = new Set(ownedPropertyIds);

  const collections = new Map();

  for (const property of properties) {
    const propertyId = getPropertyId(property);
    const collectionKey = getCollectionKey(property);

    if (!propertyId || !collectionKey) {
      continue;
    }

    if (!collections.has(collectionKey)) {
      collections.set(collectionKey, {
    key: collectionKey,
    displayName:
        getCollectionDisplayName(property) ??
        collectionKey,
    propertyIds: [],
});
    }

    collections
      .get(collectionKey)
      .propertyIds
      .push(propertyId);
  }

  const completedSets = [];

  for (const collection of collections.values()) {
    const ownsEntireCollection =
      collection.propertyIds.length > 0 &&
      collection.propertyIds.every(propertyId =>
        owned.has(propertyId)
      );

    if (ownsEntireCollection) {
      completedSets.push(collection.key);
    }
  }

  return completedSets;
}

/*
|--------------------------------------------------------------------------
| BUTTON HELPERS
|--------------------------------------------------------------------------
*/

function disableButtons(message) {
  return message.components.map(row => {
    const disabledRow = ActionRowBuilder.from(row);

    disabledRow.components = row.components.map(component =>
      ButtonBuilder.from(component).setDisabled(true)
    );

    return disabledRow;
  });
}

async function getPublicTradeMessage(
  interaction,
  trade
) {
  try {
    const channel =
      interaction.client.channels.cache.get(
        trade.channelId
      ) ??
      (await interaction.client.channels.fetch(
        trade.channelId
      ));

    if (!channel?.isTextBased()) {
      return null;
    }

    return await channel.messages.fetch(
      trade.messageId
    );
  } catch (error) {
    console.error(
      'Could not fetch public trade message:',
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| VALIDATE A PENDING TRADE
|--------------------------------------------------------------------------
*/

async function getValidTrade(
  interaction,
  tradeId
) {
  const trade = await Trade.findById(tradeId);

  if (!trade) {
    await interaction.reply({
      content:
        'Mrs. Bookopoly cannot locate that contract in her ledger.',
      flags: MessageFlags.Ephemeral,
    });

    return null;
  }

  if (trade.status !== 'pending') {
    await interaction.reply({
      content:
        `This contract is no longer pending. Its current status is **${trade.status}**.`,
      flags: MessageFlags.Ephemeral,
    });

    return null;
  }

  if (
    trade.expiresAt &&
    trade.expiresAt.getTime() <= Date.now()
  ) {
    trade.status = 'expired';
    trade.completedAt = new Date();

    await trade.save();

    const publicMessage =
      await getPublicTradeMessage(
        interaction,
        trade
      );

    if (publicMessage) {
      const originalEmbed =
        publicMessage.embeds[0];

      const expiredEmbed = originalEmbed
        ? EmbedBuilder.from(originalEmbed)
            .setColor(0x777777)
            .setTitle('⌛ Trade Expired')
            .setDescription(
              'This contract expired before it was accepted.\n\n' +
              'Mrs. Bookopoly has released all frozen properties and Baddie Bucks.'
            )
            .setTimestamp()
        : new EmbedBuilder()
            .setColor(0x777777)
            .setTitle('⌛ Trade Expired')
            .setDescription(
              'Mrs. Bookopoly has released all frozen assets.'
            )
            .setTimestamp();

      await publicMessage.edit({
        content: '',
        embeds: [expiredEmbed],
        components:
          disableButtons(publicMessage),
      });
    }

    await interaction.reply({
      content:
        'This contract has expired. Mrs. Bookopoly has released all frozen assets.',
      flags: MessageFlags.Ephemeral,
    });

    return null;
  }

  if (
    interaction.user.id !==
    trade.recipientId
  ) {
    await interaction.reply({
      content:
        'Only the player who received this trade offer may review the contract.',
      flags: MessageFlags.Ephemeral,
    });

    return null;
  }

  return trade;
}

/*
|--------------------------------------------------------------------------
| CHECK ASSETS RESERVED BY OTHER TRADES
|--------------------------------------------------------------------------
*/

async function getReservedBucksExcludingTrade(
  guildId,
  userId,
  excludedTradeId,
  session
) {
  const pendingTrades = await Trade.find({
    _id: {
      $ne: excludedTradeId,
    },
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
  })
    .session(session)
    .lean();

  let reservedBucks = 0;

  for (const pendingTrade of pendingTrades) {
    if (
      pendingTrade.senderId === userId
    ) {
      reservedBucks +=
        pendingTrade.offeredBucks ?? 0;
    }

    if (
      pendingTrade.recipientId === userId
    ) {
      reservedBucks +=
        pendingTrade.requestedBucks ?? 0;
    }
  }

  return reservedBucks;
}

async function isPropertyReservedElsewhere(
  guildId,
  userId,
  propertyId,
  excludedTradeId,
  session
) {
  if (!propertyId) {
    return false;
  }

  const pendingTrade = await Trade.findOne({
    _id: {
      $ne: excludedTradeId,
    },
    guildId,
    status: 'pending',
    expiresAt: {
      $gt: new Date(),
    },
    $or: [
      {
        senderId: userId,
        offeredProperty: propertyId,
      },
      {
        recipientId: userId,
        requestedProperty: propertyId,
      },
    ],
  }).session(session);

  return Boolean(pendingTrade);
}

/*
|--------------------------------------------------------------------------
| ACCEPT BUTTON
|--------------------------------------------------------------------------
*/

async function handleAccept(
  interaction,
  tradeId
) {
  const trade = await getValidTrade(
    interaction,
    tradeId
  );

  if (!trade) {
    return;
  }

  const confirmationEmbed =
    new EmbedBuilder()
      .setColor(0xf45aa5)
      .setTitle('🖋️ Confirm This Trade?')
      .setDescription(
        'Please review the public contract one final time.\n\n' +
        '**Confirm Trade** will immediately exchange every listed property and Baddie Buck.\n\n' +
        '**Go Back** will close this confirmation without changing the contract.'
      )
      .setFooter({
        text: `Trade ID: ${trade._id}`,
      })
      .setTimestamp();

  const confirmationButtons =
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          `trade_confirm:${trade._id}`
        )
        .setLabel('Confirm Trade')
        .setEmoji('🤝')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(
          `trade_back:${trade._id}`
        )
        .setLabel('Go Back')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({
    embeds: [confirmationEmbed],
    components: [confirmationButtons],
    flags: MessageFlags.Ephemeral,
  });
}

/*
|--------------------------------------------------------------------------
| DECLINE BUTTON
|--------------------------------------------------------------------------
*/

async function handleDecline(
  interaction,
  tradeId
) {
  const trade = await getValidTrade(
    interaction,
    tradeId
  );

  if (!trade) {
    return;
  }

  trade.status = 'declined';
  trade.completedAt = new Date();

  await trade.save();

  const originalEmbed =
    interaction.message.embeds[0];

  const declinedEmbed = originalEmbed
    ? EmbedBuilder.from(originalEmbed)
        .setColor(0x8b1e3f)
        .setTitle('❌ Trade Declined')
        .setDescription(
          `<@${trade.recipientId}> declined the proposed exchange.\n\n` +
          'Mrs. Bookopoly has released every property and Baddie Buck attached to the contract.'
        )
        .setTimestamp()
    : new EmbedBuilder()
        .setColor(0x8b1e3f)
        .setTitle('❌ Trade Declined')
        .setDescription(
          'Mrs. Bookopoly has released all frozen assets.'
        )
        .setTimestamp();

  await interaction.update({
    content: '',
    embeds: [declinedEmbed],
    components:
      disableButtons(interaction.message),
    allowedMentions: {
      users: [],
    },
  });

  const declineNotice = new EmbedBuilder()
    .setColor(0x8b1e3f)
    .setTitle('📜 Contract Declined')
    .setDescription(
      `<@${trade.senderId}>, <@${trade.recipientId}> has declined your trade offer.\n\n` +
      'No assets were exchanged, and everything reserved for this contract is available again.'
    )
    .setFooter({
      text: 'Mrs. Bookopoly has closed the ledger on this offer.',
    })
    .setTimestamp();

  await interaction.followUp({
    content: `<@${trade.senderId}>`,
    embeds: [declineNotice],
    allowedMentions: {
      users: [trade.senderId],
    },
  });
}

/*
|--------------------------------------------------------------------------
| GO BACK BUTTON
|--------------------------------------------------------------------------
*/

async function handleBack(
  interaction,
  tradeId
) {
  const trade = await Trade.findById(
    tradeId
  );

  if (!trade) {
    await interaction.update({
      content:
        'Mrs. Bookopoly cannot locate that contract.',
      embeds: [],
      components: [],
    });

    return;
  }

  if (
    interaction.user.id !==
    trade.recipientId
  ) {
    await interaction.reply({
      content:
        'Only the trade recipient may control this confirmation.',
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  await interaction.update({
    content:
      'No changes were made. The trade offer is still pending.',
    embeds: [],
    components: [],
  });
}

/*
|--------------------------------------------------------------------------
| CONFIRM AND EXECUTE THE TRADE
|--------------------------------------------------------------------------
*/

async function handleConfirm(
  interaction,
  tradeId
) {
  /*
   * Acknowledge immediately so Discord does not time out while MongoDB
   * validates and transfers everything.
   */

  await interaction.deferUpdate();

  const trade = await Trade.findById(
    tradeId
  );

  if (!trade) {
    await interaction.editReply({
      content:
        'Mrs. Bookopoly cannot locate that contract.',
      embeds: [],
      components: [],
    });

    return;
  }

  if (
    interaction.user.id !==
    trade.recipientId
  ) {
    await interaction.editReply({
      content:
        'Only the trade recipient may confirm this contract.',
      embeds: [],
      components: [],
    });

    return;
  }

  if (trade.status !== 'pending') {
    await interaction.editReply({
      content:
        `This contract is already **${trade.status}**.`,
      embeds: [],
      components: [],
    });

    return;
  }

  if (
    trade.expiresAt &&
    trade.expiresAt.getTime() <= Date.now()
  ) {
    trade.status = 'expired';
    trade.completedAt = new Date();

    await trade.save();

    await interaction.editReply({
      content:
        'This contract expired before it could be finalized.',
      embeds: [],
      components: [],
    });

    return;
  }

  const session =
    await mongoose.startSession();

  let sender;
  let recipient;

  try {
    await session.withTransaction(
      async () => {
        /*
         * Claim the trade before moving anything.
         * This prevents someone from confirming it twice.
         */

        const claimedTrade =
          await Trade.findOneAndUpdate(
            {
              _id: trade._id,
              status: 'pending',
            },
            {
              $set: {
                status: 'processing',
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!claimedTrade) {
          throw new Error(
            'TRADE_ALREADY_PROCESSED'
          );
        }

        sender = await Player.findOne({
          guildId: trade.guildId,
          userId: trade.senderId,
        }).session(session);

        recipient = await Player.findOne({
          guildId: trade.guildId,
          userId: trade.recipientId,
        }).session(session);

        if (!sender || !recipient) {
          throw new Error(
            'PLAYER_NOT_FOUND'
          );
        }

        sender.properties ??= [];
        recipient.properties ??= [];

        sender.completedSets ??= [];
        recipient.completedSets ??= [];

        sender.balance ??= 0;
        recipient.balance ??= 0;

        /*
         * Recheck property ownership.
         */

        if (
          trade.offeredProperty &&
          !sender.properties.includes(
            trade.offeredProperty
          )
        ) {
          throw new Error(
            'SENDER_NO_LONGER_OWNS_PROPERTY'
          );
        }

        if (
          trade.requestedProperty &&
          !recipient.properties.includes(
            trade.requestedProperty
          )
        ) {
          throw new Error(
            'RECIPIENT_NO_LONGER_OWNS_PROPERTY'
          );
        }

        /*
         * Make sure neither property is locked by another pending contract.
         */

        const senderPropertyReserved =
          await isPropertyReservedElsewhere(
            trade.guildId,
            trade.senderId,
            trade.offeredProperty,
            trade._id,
            session
          );

        if (senderPropertyReserved) {
          throw new Error(
            'SENDER_PROPERTY_RESERVED'
          );
        }

        const recipientPropertyReserved =
          await isPropertyReservedElsewhere(
            trade.guildId,
            trade.recipientId,
            trade.requestedProperty,
            trade._id,
            session
          );

        if (recipientPropertyReserved) {
          throw new Error(
            'RECIPIENT_PROPERTY_RESERVED'
          );
        }

        /*
         * Recheck spendable BB after subtracting other pending contracts.
         */

        const senderReservedBucks =
          await getReservedBucksExcludingTrade(
            trade.guildId,
            trade.senderId,
            trade._id,
            session
          );

        const recipientReservedBucks =
          await getReservedBucksExcludingTrade(
            trade.guildId,
            trade.recipientId,
            trade._id,
            session
          );

        const senderAvailableBucks =
          sender.balance -
          senderReservedBucks;

        const recipientAvailableBucks =
          recipient.balance -
          recipientReservedBucks;

        if (
          (trade.offeredBucks ?? 0) >
          senderAvailableBucks
        ) {
          throw new Error(
            'SENDER_INSUFFICIENT_FUNDS'
          );
        }

        if (
          (trade.requestedBucks ?? 0) >
          recipientAvailableBucks
        ) {
          throw new Error(
            'RECIPIENT_INSUFFICIENT_FUNDS'
          );
        }

        /*
         * Transfer the sender's offered property.
         */

        if (trade.offeredProperty) {
          sender.properties =
            sender.properties.filter(
              propertyId =>
                propertyId !==
                trade.offeredProperty
            );

          if (
            !recipient.properties.includes(
              trade.offeredProperty
            )
          ) {
            recipient.properties.push(
              trade.offeredProperty
            );
          }
        }

        /*
         * Transfer the recipient's requested property.
         */

        if (trade.requestedProperty) {
          recipient.properties =
            recipient.properties.filter(
              propertyId =>
                propertyId !==
                trade.requestedProperty
            );

          if (
            !sender.properties.includes(
              trade.requestedProperty
            )
          ) {
            sender.properties.push(
              trade.requestedProperty
            );
          }
        }

        /*
         * Transfer Baddie Bucks.
         *
         * Offered BB:
         * sender → recipient
         *
         * Requested BB:
         * recipient → sender
         */

        const offeredBucks =
          trade.offeredBucks ?? 0;

        const requestedBucks =
          trade.requestedBucks ?? 0;

        sender.balance =
          sender.balance -
          offeredBucks +
          requestedBucks;

        recipient.balance =
          recipient.balance +
          offeredBucks -
          requestedBucks;

        /*
         * Recalculate completed collections for both players.
         */

        sender.completedSets =
          calculateCompletedSets(
            sender.properties
          );

        recipient.completedSets =
          calculateCompletedSets(
            recipient.properties
          );

        await sender.save({
          session,
        });

        await recipient.save({
          session,
        });

        claimedTrade.status =
          'accepted';

        claimedTrade.completedAt =
          new Date();

        await claimedTrade.save({
          session,
        });
      }
    );
  } catch (error) {
    console.error(
      'Trade execution error:',
      error
    );

    /*
     * If the transaction failed after status became processing,
     * reset it to pending unless it was completed elsewhere.
     */

    await Trade.updateOne(
      {
        _id: trade._id,
        status: 'processing',
      },
      {
        $set: {
          status: 'pending',
        },
      }
    );

    const errorMessages = {
      TRADE_ALREADY_PROCESSED:
        'This contract has already been handled.',

      PLAYER_NOT_FOUND:
        'Mrs. Bookopoly could not locate one of the player accounts attached to this contract.',

      SENDER_NO_LONGER_OWNS_PROPERTY:
        'The original sender no longer owns the property they offered.',

      RECIPIENT_NO_LONGER_OWNS_PROPERTY:
        'You no longer own the property requested in this contract.',

      SENDER_PROPERTY_RESERVED:
        'The sender’s property is currently reserved by another contract.',

      RECIPIENT_PROPERTY_RESERVED:
        'Your property is currently reserved by another contract.',

      SENDER_INSUFFICIENT_FUNDS:
        'The sender no longer has enough available Baddie Bucks to complete this exchange.',

      RECIPIENT_INSUFFICIENT_FUNDS:
        'You no longer have enough available Baddie Bucks to complete this exchange.',
    };

    const message =
      errorMessages[error.message] ??
      'Mrs. Bookopoly could not finalize this contract. No assets were exchanged.';

    await interaction.editReply({
      content: `❌ ${message}`,
      embeds: [],
      components: [],
    });

    return;
  } finally {
    await session.endSession();
  }

  /*
   * Update the recipient's private confirmation.
   */

  await interaction.editReply({
    content:
      '✅ The contract has been finalized. Mrs. Bookopoly has completed the exchange!',
    embeds: [],
    components: [],
  });

  /*
   * Update the original public trade message.
   */

  const publicMessage =
    await getPublicTradeMessage(
      interaction,
      trade
    );

  if (publicMessage) {
    const originalEmbed =
      publicMessage.embeds[0];

    const acceptedEmbed = originalEmbed
      ? EmbedBuilder.from(originalEmbed)
          .setColor(0x4caf50)
          .setTitle('✅ Trade Accepted')
          .setDescription(
            `<@${trade.senderId}> and <@${trade.recipientId}> have finalized this exchange.\n\n` +
            'Mrs. Bookopoly has transferred every listed property and Baddie Buck.'
          )
          .setTimestamp()
      : new EmbedBuilder()
          .setColor(0x4caf50)
          .setTitle('✅ Trade Accepted')
          .setDescription(
            'Mrs. Bookopoly has completed the exchange.'
          )
          .setTimestamp();

    await publicMessage.edit({
      content: '',
      embeds: [acceptedEmbed],
      components:
        disableButtons(publicMessage),
      allowedMentions: {
        users: [],
      },
    });

    /*
     * Build the separate completion announcement.
     */

    const exchangedItems = [];

    if (trade.offeredProperty) {
      exchangedItems.push(
        `${getPropertyEmoji(
          trade.offeredProperty
        )} <@${trade.recipientId}> received **${getPropertyName(
          trade.offeredProperty
        )}**`
      );
    }

    if (
      (trade.offeredBucks ?? 0) > 0
    ) {
      exchangedItems.push(
        `💵 <@${trade.recipientId}> received **${trade.offeredBucks.toLocaleString()} BB**`
      );
    }

    if (trade.requestedProperty) {
      exchangedItems.push(
        `${getPropertyEmoji(
          trade.requestedProperty
        )} <@${trade.senderId}> received **${getPropertyName(
          trade.requestedProperty
        )}**`
      );
    }

    if (
      (trade.requestedBucks ?? 0) > 0
    ) {
      exchangedItems.push(
        `💵 <@${trade.senderId}> received **${trade.requestedBucks.toLocaleString()} BB**`
      );
    }

    const completionEmbed =
      new EmbedBuilder()
        .setColor(0xf45aa5)
        .setTitle('🤝 THE INK HAS DRIED')
        .setDescription(
          `<@${trade.senderId}> and <@${trade.recipientId}> have officially completed their trade!\n\n` +
          exchangedItems
            .map(item => `• ${item}`)
            .join('\n')
        )
        .addFields(
          {
            name: `💰 ${sender.username ?? 'Sender'}’s New Balance`,
            value:
              `**${sender.balance.toLocaleString()} BB**`,
            inline: true,
          },
          {
            name: `💰 ${recipient.username ?? 'Recipient'}’s New Balance`,
            value:
              `**${recipient.balance.toLocaleString()} BB**`,
            inline: true,
          }
        )
        .setFooter({
          text:
            'The properties have changed hands, and the ledger has been updated.',
        })
        .setTimestamp();

    await publicMessage.reply({
      content:
        `<@${trade.senderId}> <@${trade.recipientId}>`,
      embeds: [completionEmbed],
      allowedMentions: {
        users: [
          trade.senderId,
          trade.recipientId,
        ],
      },
    });
  }
}

/*
|--------------------------------------------------------------------------
| BUTTON ROUTER
|--------------------------------------------------------------------------
*/

module.exports =
  async function tradeButtons(
    interaction
  ) {
    const [action, tradeId] =
      interaction.customId.split(':');

    if (!tradeId) {
      await interaction.reply({
        content:
          'Mrs. Bookopoly could not read the contract number attached to that button.',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    switch (action) {
      case 'trade_accept':
        await handleAccept(
          interaction,
          tradeId
        );
        break;

      case 'trade_decline':
        await handleDecline(
          interaction,
          tradeId
        );
        break;

      case 'trade_confirm':
        await handleConfirm(
          interaction,
          tradeId
        );
        break;

      case 'trade_back':
        await handleBack(
          interaction,
          tradeId
        );
        break;

      default:
        await interaction.reply({
          content:
            'Mrs. Bookopoly does not recognize that contract action.',
          flags:
            MessageFlags.Ephemeral,
        });
    }
  };
