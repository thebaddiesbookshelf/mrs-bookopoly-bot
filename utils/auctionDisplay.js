const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const {
  getPropertyById,
} = require('../data/properties');

/*
|--------------------------------------------------------------------------
| TIME REMAINING
|--------------------------------------------------------------------------
*/

function getRemainingText(endsAt) {
  if (!endsAt) {
    return 'Unknown';
  }

  const seconds = Math.max(
    0,
    Math.floor(
      (endsAt.getTime() - Date.now()) /
        1000
    )
  );

  if (seconds === 0) {
    return 'Ending...';
  }

  return `<t:${Math.floor(
    endsAt.getTime() / 1000
  )}:R>`;
}

/*
|--------------------------------------------------------------------------
| BUILD AUCTION EMBED
|--------------------------------------------------------------------------
*/

function buildAuctionEmbed(
  auction,
  property
) {
  property ??=
    getPropertyById(
      auction.propertyId
    );

  const embed =
    new EmbedBuilder()
      .setColor(
        property?.setColor ??
          0xf45aa5
      )
      .setTitle(
        '🏛️ PROPERTY AUCTION'
      )
      .setDescription(
        'Mrs. Bookopoly has placed a property up for auction.\n\n' +
          `${property?.setEmoji ?? '🏡'} **${
            property?.name ??
            'Unknown Property'
          }**`
      )
      .addFields(
        {
          name: '📚 Collection',
          value:
            property?.setDisplayName ??
            'Unknown',
          inline: true,
        },

        {
          name: '⭐ Rarity',
          value:
            property?.rarity ??
            'Unknown',
          inline: true,
        },

        {
          name: '🏦 Current Owner',
          value:
            'The Bank of Bookopoly',
          inline: true,
        },

        {
          name: '💰 Highest Bid',
          value:
            auction.highestBid > 0
              ? `**${auction.highestBid.toLocaleString()} BB**`
              : '*No bids yet*',
          inline: true,
        },

        {
          name:
            '👤 Highest Bidder',
          value:
            auction.highestBidderId
              ? `<@${auction.highestBidderId}>`
              : '*None*',
          inline: true,
        },

        {
          name: '⏳ Ends',
          value: getRemainingText(
            auction.endsAt
          ),
          inline: true,
        }
      )

      .setFooter({
        text:
          'Click "Place Bid" below to participate.',
      })

      .setTimestamp();

  return embed;
}

/*
|--------------------------------------------------------------------------
| BUILD BID BUTTON
|--------------------------------------------------------------------------
*/

function buildAuctionButtons(
  auction
) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          `auction_bid:${auction._id}`
        )
        .setEmoji('💰')
        .setLabel('Place Bid')
        .setStyle(
          ButtonStyle.Primary
        )
    ),
  ];
}

/*
|--------------------------------------------------------------------------
| DISABLE BUTTONS
|--------------------------------------------------------------------------
*/

function disableAuctionButtons(
  message
) {
  return message.components.map(
    row => {
      const disabledRow =
        ActionRowBuilder.from(
          row
        );

      disabledRow.components =
        row.components.map(
          component =>
            ButtonBuilder.from(
              component
            ).setDisabled(true)
        );

      return disabledRow;
    }
  );
}

/*
|--------------------------------------------------------------------------
| FETCH PUBLIC MESSAGE
|--------------------------------------------------------------------------
*/

async function getAuctionMessage(
  client,
  auction
) {
  try {
    const channel =
      client.channels.cache.get(
        auction.channelId
      ) ??
      (await client.channels.fetch(
        auction.channelId
      ));

    if (!channel?.isTextBased()) {
      return null;
    }

    return await channel.messages.fetch(
      auction.messageId
    );
  } catch (error) {
    console.error(
      'Unable to fetch auction message:',
      error
    );

    return null;
  }
}

module.exports = {
  buildAuctionEmbed,
  buildAuctionButtons,
  disableAuctionButtons,
  getAuctionMessage,
};