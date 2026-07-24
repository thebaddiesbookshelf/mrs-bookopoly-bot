const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const Trade = require('../../models/Trade');

const {
  properties,
  getPropertyById,
} = require('../../data/properties');

const { getRandomQuote } = require('../../utils/quotes');

const TRADE_COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours 
const TRADE_EXPIRATION = 2 * 60 * 60 * 1000; // 2 hours

function getPropertyTitle(propertyId) {
  if (!propertyId) {
    return null;
  }

  const property = getPropertyById(propertyId);

  if (!property) {
    return propertyId;
  }

  return property.name ?? property.title ?? propertyId;
}

function getPropertyCollection(propertyId) {
  if (!propertyId) {
    return null;
  }

  const property = getPropertyById(propertyId);

  if (!property) {
    return null;
  }

  return (
    property.setDisplayName ??
    property.setName ??
    property.collectionName ??
    null
  );
}

function getPropertyEmoji(propertyId) {
  if (!propertyId) {
    return '🏡';
  }

  const property = getPropertyById(propertyId);

  return property?.setEmoji ?? property?.emoji ?? '🏡';
}

function formatProperty(propertyId) {
  if (!propertyId) {
    return null;
  }

  const title = getPropertyTitle(propertyId);
  const collection = getPropertyCollection(propertyId);
  const emoji = getPropertyEmoji(propertyId);

  if (collection) {
    return `${emoji} **${title}**\n└ ${collection}`;
  }

  return `${emoji} **${title}**`;
}

function formatBucks(amount) {
  return `💵 **${amount.toLocaleString()} Baddie Bucks**`;
}

async function expireOldTrades(guildId) {
  await Trade.updateMany(
    {
      guildId,
      status: 'pending',
      expiresAt: {
        $lte: new Date(),
      },
    },
    {
      $set: {
        status: 'expired',
        completedAt: new Date(),
      },
    }
  );
}

async function getReservedBucks(guildId, userId) {
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

  let reserved = 0;

  for (const trade of pendingTrades) {
    if (trade.senderId === userId) {
      reserved += trade.offeredBucks ?? 0;
    }

    if (trade.recipientId === userId) {
      reserved += trade.requestedBucks ?? 0;
    }
  }

  return reserved;
}

async function isPropertyReserved(
  guildId,
  userId,
  propertyId
) {
  if (!propertyId) {
    return false;
  }

  const pendingTrade = await Trade.findOne({
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
  }).lean();

  return Boolean(pendingTrade);
}

function buildErrorEmbed(interaction, title, description) {
  return new EmbedBuilder()
    .setColor(0x8b1e3f)
    .setAuthor({
      name: 'Mrs. Bookopoly reviews the contract...',
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setTitle(title)
    .setDescription(description)
    .setFooter({
      text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
    })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription(
      'Trade properties or Baddie Bucks with another player.'
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('offer')
        .setDescription('Offer another player a trade.')

        .addUserOption(option =>
          option
            .setName('member')
            .setDescription(
              'The player you want to trade with.'
            )
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName('offer_property')
            .setDescription(
              'A property you are offering.'
            )
            .setAutocomplete(true)
            .setRequired(false)
        )

        .addIntegerOption(option =>
          option
            .setName('offer_bucks')
            .setDescription(
              'Baddie Bucks you are offering.'
            )
            .setMinValue(1)
            .setRequired(false)
        )

        .addStringOption(option =>
          option
            .setName('request_property')
            .setDescription(
              'A property you want from them.'
            )
            .setAutocomplete(true)
            .setRequired(false)
        )

        .addIntegerOption(option =>
          option
            .setName('request_bucks')
            .setDescription(
              'Baddie Bucks you want from them.'
            )
            .setMinValue(1)
            .setRequired(false)
        )
    ),

  async autocomplete(interaction) {
    try {
      const focusedOption =
        interaction.options.getFocused(true);

      if (
        focusedOption.name !== 'offer_property' &&
        focusedOption.name !== 'request_property'
      ) {
        await interaction.respond([]);
        return;
      }

      const search = focusedOption.value
        .toLowerCase()
        .trim();

      const results = properties
        .filter(property => {
          const propertyId =
            property.id ??
            property.propertyId ??
            '';

          const title =
            property.name ??
            property.title ??
            propertyId;

          const collection =
            property.setDisplayName ??
            property.setName ??
            '';

          const searchable =
            `${title} ${collection} ${propertyId}`
              .toLowerCase();

          return searchable.includes(search);
        })
        .slice(0, 25)
        .map(property => {
          const propertyId =
            property.id ??
            property.propertyId;

          const title =
            property.name ??
            property.title ??
            propertyId;

          const collection =
            property.setDisplayName ??
            property.setName ??
            '';

          const emoji =
            property.setEmoji ??
            property.emoji ??
            '🏡';

          const optionName = collection
            ? `${emoji} ${title} • ${collection}`
            : `${emoji} ${title}`;

          return {
            name: optionName.slice(0, 100),
            value: propertyId,
          };
        })
        .filter(option => option.value);

      await interaction.respond(results);
    } catch (error) {
      console.error('Trade autocomplete error:', error);

      if (!interaction.responded) {
        await interaction.respond([]);
      }
    }
  },

  async execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const senderUser = interaction.user;

    const recipientUser =
      interaction.options.getUser('member', true);

    const offeredProperty =
      interaction.options.getString('offer_property');

    const offeredBucks =
      interaction.options.getInteger('offer_bucks') ?? 0;

    const requestedProperty =
      interaction.options.getString('request_property');

    const requestedBucks =
      interaction.options.getInteger('request_bucks') ?? 0;

    await expireOldTrades(guildId);

    if (recipientUser.id === senderUser.id) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Contract Rejected',
        'Mrs. Bookopoly refuses to notarize a trade with yourself.'
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    if (recipientUser.bot) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Contract Rejected',
        'Bots cannot participate in Bookopoly property trades.'
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    if (!offeredProperty && offeredBucks <= 0) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Nothing Was Offered',
        'You must offer at least one property or some Baddie Bucks.'
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    if (!requestedProperty && requestedBucks <= 0) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Nothing Was Requested',
        'You must request at least one property or some Baddie Bucks.'
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    let sender = await Player.findOne({
      guildId,
      userId: senderUser.id,
    });

    if (!sender) {
      sender = await Player.create({
        guildId,
        userId: senderUser.id,
        username: senderUser.username,
        balance: 0,
        properties: [],
        completedSets: [],
        getOutOfJailCards: 0,
        cardsDrawn: 0,
        jailVisits: 0,
        isInJail: false,
        lastCardDraw: null,
      });
    }

    let recipient = await Player.findOne({
      guildId,
      userId: recipientUser.id,
    });

    if (!recipient) {
      recipient = await Player.create({
        guildId,
        userId: recipientUser.id,
        username: recipientUser.username,
        balance: 0,
        properties: [],
        completedSets: [],
        getOutOfJailCards: 0,
        cardsDrawn: 0,
        jailVisits: 0,
        isInJail: false,
        lastCardDraw: null,
      });
    }

    sender.username = senderUser.username;
    recipient.username = recipientUser.username;

    sender.properties ??= [];
    recipient.properties ??= [];

    sender.balance ??= 0;
    recipient.balance ??= 0;

    await sender.save();
    await recipient.save();

    const mostRecentTrade = await Trade.findOne({
      guildId,
      senderId: senderUser.id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (mostRecentTrade) {
      const nextTradeTime =
        new Date(mostRecentTrade.createdAt).getTime() +
        TRADE_COOLDOWN;

      if (Date.now() < nextTradeTime) {
        const timestamp = Math.floor(
          nextTradeTime / 1000
        );

        const embed = buildErrorEmbed(
          interaction,
          '⏳ Contract Cooldown',
          'Mrs. Bookopoly is still reviewing your previous contract.\n\n' +
          `You may initiate another trade <t:${timestamp}:R>.`
        );

        await interaction.editReply({
          embeds: [embed],
        });

        return;
      }
    }

    if (
      offeredProperty &&
      !sender.properties.includes(offeredProperty)
    ) {
      const title = getPropertyTitle(offeredProperty);

      const embed = buildErrorEmbed(
        interaction,
        '❌ Property Not Owned',
        `You cannot offer **${title}** because it is not currently in your portfolio.`
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    if (
      requestedProperty &&
      !recipient.properties.includes(requestedProperty)
    ) {
      const title = getPropertyTitle(requestedProperty);

      const embed = buildErrorEmbed(
        interaction,
        '❌ Property Not Owned',
        `${recipientUser} does not currently own **${title}**.`
      );

      await interaction.editReply({
        embeds: [embed],
        allowedMentions: {
          users: [],
        },
      });

      return;
    }

    if (
      offeredProperty &&
      requestedProperty &&
      offeredProperty === requestedProperty
    ) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Invalid Exchange',
        'The same property cannot appear on both sides of the trade.'
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    const senderReservedBucks =
      await getReservedBucks(
        guildId,
        senderUser.id
      );

    const senderAvailableBucks =
      sender.balance - senderReservedBucks;

    if (offeredBucks > senderAvailableBucks) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Insufficient Available Funds',
        `You currently have **${sender.balance.toLocaleString()} BB**, but ` +
        `**${senderReservedBucks.toLocaleString()} BB** is already tied to pending trades.\n\n` +
        `Available to trade: **${Math.max(
          senderAvailableBucks,
          0
        ).toLocaleString()} BB**`
      );

      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    const recipientReservedBucks =
      await getReservedBucks(
        guildId,
        recipientUser.id
      );

    const recipientAvailableBucks =
      recipient.balance - recipientReservedBucks;

    if (requestedBucks > recipientAvailableBucks) {
      const embed = buildErrorEmbed(
        interaction,
        '❌ Recipient Lacks Available Funds',
        `${recipientUser} does not currently have enough available Baddie Bucks to fulfill this request.\n\n` +
        `Available to trade: **${Math.max(
          recipientAvailableBucks,
          0
        ).toLocaleString()} BB**`
      );

      await interaction.editReply({
        embeds: [embed],
        allowedMentions: {
          users: [],
        },
      });

      return;
    }

    if (offeredProperty) {
      const propertyReserved =
        await isPropertyReserved(
          guildId,
          senderUser.id,
          offeredProperty
        );

      if (propertyReserved) {
        const title =
          getPropertyTitle(offeredProperty);

        const embed = buildErrorEmbed(
          interaction,
          '🔒 Property Already Frozen',
          `**${title}** is already tied to another pending trade.`
        );

        await interaction.editReply({
          embeds: [embed],
        });

        return;
      }
    }

    if (requestedProperty) {
      const propertyReserved =
        await isPropertyReserved(
          guildId,
          recipientUser.id,
          requestedProperty
        );

      if (propertyReserved) {
        const title =
          getPropertyTitle(requestedProperty);

        const embed = buildErrorEmbed(
          interaction,
          '🔒 Property Already Frozen',
          `**${title}** is already tied to another pending trade.`
        );

        await interaction.editReply({
          embeds: [embed],
        });

        return;
      }
    }

    const expiresAt = new Date(
      Date.now() + TRADE_EXPIRATION
    );

    const trade = await Trade.create({
      guildId,
      senderId: senderUser.id,
      recipientId: recipientUser.id,
      offeredProperty: offeredProperty ?? null,
      requestedProperty: requestedProperty ?? null,
      offeredBucks,
      requestedBucks,
      status: 'pending',
      expiresAt,
      channelId: interaction.channelId,
    });

    const senderOffers = [];

    if (offeredProperty) {
      senderOffers.push(
        formatProperty(offeredProperty)
      );
    }

    if (offeredBucks > 0) {
      senderOffers.push(
        formatBucks(offeredBucks)
      );
    }

    const recipientOffers = [];

    if (requestedProperty) {
      recipientOffers.push(
        formatProperty(requestedProperty)
      );
    }

    if (requestedBucks > 0) {
      recipientOffers.push(
        formatBucks(requestedBucks)
      );
    }

    const expirationTimestamp = Math.floor(
      expiresAt.getTime() / 1000
    );

    const tradeEmbed = new EmbedBuilder()
      .setColor(0xf45aa5)
      .setAuthor({
        name: 'Mrs. Bookopoly presents a contract...',
        iconURL:
          interaction.client.user.displayAvatarURL(),
      })
      .setTitle('🤝 Trade Offer')
      .setDescription(
        `${recipientUser}, ${senderUser} has submitted a trade for your review.\n\n` +
        'Only the recipient may approve or decline this contract.'
      )
      .addFields(
        {
          name: `📤 ${senderUser.displayName} Offers`,
          value: senderOffers.join('\n\n'),
          inline: true,
        },
        {
          name: `📥 ${senderUser.displayName} Requests`,
          value: recipientOffers.join('\n\n'),
          inline: true,
        },
        {
          name: '⏳ Contract Expiration',
          value:
            `Expires <t:${expirationTimestamp}:R>\n` +
            `<t:${expirationTimestamp}:F>`,
          inline: false,
        },
        {
          name: '🔒 Frozen Assets',
          value:
            'All listed properties and Baddie Bucks are reserved until this contract is accepted, declined, or expires.',
          inline: false,
        }
      )
      .setThumbnail(
        recipientUser.displayAvatarURL()
      )
      .setFooter({
        text:
          `Trade ID: ${trade._id} • ` +
          `“${getRandomQuote()}” — Mrs. Bookopoly`,
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          `trade_accept:${trade._id}`
        )
        .setLabel('Accept Trade')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(
          `trade_decline:${trade._id}`
        )
        .setLabel('Decline Trade')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.editReply({
      content: `${recipientUser}`,
      embeds: [tradeEmbed],
      components: [buttons],
      allowedMentions: {
        users: [recipientUser.id],
      },
    });

    trade.messageId = message.id;
    trade.channelId = message.channelId;

    await trade.save();
  },
};
