const {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require('discord.js');

const Auction = require('../../models/Auction');

const {
  properties,
  getPropertyById,
} = require('../../data/properties');

const { isMayor } = require('../../utils/isMayor');

/*
 * These utilities will be created in the next steps.
 *
 * Do not deploy or start the bot until they exist.
 */
const resolveAuction = require('../../utils/resolveAuction');

const {
  buildAuctionEmbed,
  buildAuctionButtons,
  disableAuctionButtons,
  getAuctionMessage,
} = require('../../utils/auctionDisplay');

const AUCTION_DURATION_MS =
  30 * 60 * 1000;

/*
|--------------------------------------------------------------------------
| WEIGHTED RANDOM PROPERTY
|--------------------------------------------------------------------------
|
| Rarity odds:
|
| Common:     45%
| Uncommon:   25%
| Rare:       15%
| Epic:       10%
| Legendary:  5%
|
*/

function chooseWeightedRarity() {
  const roll = Math.random() * 100;

  if (roll < 45) {
    return 'Common';
  }

  if (roll < 70) {
    return 'Uncommon';
  }

  if (roll < 85) {
    return 'Rare';
  }

  if (roll < 95) {
    return 'Epic';
  }

  return 'Legendary';
}

function chooseRandomProperty() {
  const chosenRarity =
    chooseWeightedRarity();

  const matchingProperties =
    properties.filter(
      property =>
        property.rarity ===
        chosenRarity
    );

  const propertyPool =
    matchingProperties.length > 0
      ? matchingProperties
      : properties;

  if (propertyPool.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() *
      propertyPool.length
  );

  return propertyPool[randomIndex];
}

/*
|--------------------------------------------------------------------------
| START AUCTION
|--------------------------------------------------------------------------
*/

async function handleStart(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  if (!interaction.guildId) {
    await interaction.editReply({
      content:
        '❌ Auctions can only be started inside a server.',
    });

    return;
  }

  if (
    !interaction.channel ||
    !interaction.channel.isTextBased()
  ) {
    await interaction.editReply({
      content:
        '❌ Mrs. Bookopoly cannot open an auction in this channel.',
    });

    return;
  }

  /*
   * Check first for a friendlier error.
   *
   * The Auction model's unique partial index
   * will also protect against two auctions being
   * created simultaneously.
   */

  const existingAuction =
    await Auction.findOne({
      guildId: interaction.guildId,
      status: 'active',
    });

  if (existingAuction) {
    const existingProperty =
      getPropertyById(
        existingAuction.propertyId
      );

    await interaction.editReply({
      content:
        '❌ An auction is already active' +
        `${
          existingProperty
            ? ` for **${existingProperty.name}**`
            : ''
        }.`,
    });

    return;
  }

  const property =
    chooseRandomProperty();

  if (!property) {
    await interaction.editReply({
      content:
        '❌ Mrs. Bookopoly could not locate any properties in the bank.',
    });

    return;
  }

  const startedAt = new Date();

  const endsAt = new Date(
    startedAt.getTime() +
      AUCTION_DURATION_MS
  );

  let auction;

  try {
    auction = await Auction.create({
      guildId: interaction.guildId,
      channelId:
        interaction.channelId,
      propertyId: property.id,

      status: 'active',

      highestBid: property.reward,
      highestBidderId: null,
      highestBidderUsername: null,

      bids: [],

      startedAt,
      endsAt,
    });
  } catch (error) {
    /*
     * MongoDB duplicate-key error.
     *
     * This can happen if two start requests
     * somehow reach the database together.
     */

    if (error?.code === 11000) {
      await interaction.editReply({
        content:
          '❌ An auction is already active.',
      });

      return;
    }

    throw error;
  }

  const auctionEmbed =
    buildAuctionEmbed(
      auction,
      property
    );

  try {
    const publicMessage =
      await interaction.channel.send({
        embeds: [auctionEmbed],
        components: buildAuctionButtons(auction),
      });

    auction.messageId =
      publicMessage.id;

    await auction.save();
  } catch (error) {
    /*
     * If Discord rejects the announcement,
     * remove the auction so it does not remain
     * active without a usable public message.
     */

    await Auction.deleteOne({
      _id: auction._id,
    });

    throw error;
  }

  await interaction.editReply({
    content:
      `✅ The auction for **${property.name}** has started and will remain open for **30 minutes**.`,
  });
}

/*
|--------------------------------------------------------------------------
| CANCEL AUCTION
|--------------------------------------------------------------------------
|
| Cancelling:
|
| - awards no property
| - deducts no BB
| - immediately releases the highest bidder's reservation
|
*/

async function handleCancel(
  interaction
) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  const auction =
    await Auction.findOneAndUpdate(
      {
        guildId:
          interaction.guildId,
        status: 'active',
      },
      {
        $set: {
          status: 'cancelled',
          completedAt: new Date(),
        },
      },
      {
        new: true,
      }
    );

  if (!auction) {
    await interaction.editReply({
      content:
        '❌ There is no active auction to cancel.',
    });

    return;
  }

  const property =
    getPropertyById(
      auction.propertyId
    );

  const publicMessage =
    await getAuctionMessage(
      interaction.client,
      auction
    );

  if (publicMessage) {
    const cancelledEmbed =
      new EmbedBuilder()
        .setColor(0x777777)
        .setTitle(
          '🚫 PROPERTY AUCTION CANCELLED'
        )
        .setDescription(
          property
            ? `The auction for ${property.setEmoji ?? '🏡'} **${property.name}** has been cancelled.\n\nNo property was awarded, no Baddie Bucks were deducted, and all reserved funds have been released.`
            : 'This auction has been cancelled.\n\nNo property was awarded, no Baddie Bucks were deducted, and all reserved funds have been released.'
        )
        .setFooter({
          text:
            'Mrs. Bookopoly has closed the auction ledger.',
        })
        .setTimestamp();

    await publicMessage.edit({
      embeds: [cancelledEmbed],
      components:
        disableAuctionButtons(
          publicMessage
        ),
    });
  }

  await interaction.editReply({
    content:
      `✅ The auction${
        property
          ? ` for **${property.name}**`
          : ''
      } has been cancelled.`,
  });
}

/*
|--------------------------------------------------------------------------
| END AUCTION EARLY
|--------------------------------------------------------------------------
|
| This does not cancel the auction.
|
| It immediately closes bidding and determines
| the winner using the same resolver as the
| automatic 30-minute expiration.
|
*/

async function handleEnd(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  const auction =
    await Auction.findOne({
      guildId:
        interaction.guildId,
      status: 'active',
    });

  if (!auction) {
    await interaction.editReply({
      content:
        '❌ There is no active auction to end.',
    });

    return;
  }

  const result =
    await resolveAuction(
      interaction.client,
      auction
    );

  if (
    result?.status ===
    'already_processed'
  ) {
    await interaction.editReply({
      content:
        '❌ That auction has already been closed or is currently being processed.',
    });

    return;
  }

  const property =
    getPropertyById(
      auction.propertyId
    );

  await interaction.editReply({
    content:
      `✅ The auction${
        property
          ? ` for **${property.name}**`
          : ''
      } has been ended and resolved.`,
  });
}

/*
|--------------------------------------------------------------------------
| COMMAND
|--------------------------------------------------------------------------
*/

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auction')
    .setDescription(
      'Manage Mrs. Bookopoly property auctions.'
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription(
          'Start a random 30-minute property auction.'
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription(
          'End the active auction immediately and determine the winner.'
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('cancel')
        .setDescription(
          'Cancel the active auction without awarding the property.'
        )
    ),

  async execute(interaction) {
    if (
      !(await isMayor(interaction))
    ) {
      return;
    }

    const subcommand =
      interaction.options.getSubcommand();

    switch (subcommand) {
      case 'start':
        await handleStart(
          interaction
        );
        break;

      case 'end':
        await handleEnd(
          interaction
        );
        break;

      case 'cancel':
        await handleCancel(
          interaction
        );
        break;

      default:
        await interaction.reply({
          content:
            'Mrs. Bookopoly does not recognize that auction action.',
          flags:
            MessageFlags.Ephemeral,
        });
    }
  },
};