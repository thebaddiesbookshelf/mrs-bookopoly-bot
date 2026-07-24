const {
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const {
  chanceCards,
  communityChestCards,
  getRandomCard,
} = require('../../utils/cards');
const { getRandomQuote } = require('../../utils/quotes');
const {
  sendLockupAnnouncement,
} = require('../../utils/lockupAnnouncements');
const { addLockupRole } = require('../../utils/lockupRole');

const DRAW_COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours
const CHANCE_CARD_PROBABILITY = 0.3; // 30% Chance, 70% Community Chest

module.exports = {
  data: new SlashCommandBuilder()
    .setName('draw')
    .setDescription('Draw a Bookopoly card and discover your fate.'),

  async execute(interaction) {
    await interaction.deferReply();

    const now = new Date();

    let player = await Player.findOne({
      guildId: interaction.guildId,
      userId: interaction.user.id,
    });

    if (!player) {
      player = await Player.create({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        username: interaction.user.username,
        balance: 0,
        properties: [],
        completedSets: [],
        getOutOfJailCards: 0,
        isInJail: false,
        jailReason: null,
        jailBookedAt: null,
        lastCardDraw: null,
      });
    }

    player.username = interaction.user.username;

    player.cardsDrawn ??= 0;
    player.jailVisits ??= 0;


    // Block players who are currently in Literary Lockup.
    if (player.isInJail) {
      const jailEmbed = new EmbedBuilder()
        .setColor(0x8b1e3f)
        .setAuthor({
          name: 'Mrs. Bookopoly closes the deck...',
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTitle('🚔 Literary Lockup')
        .setDescription(
          `${interaction.user}, you cannot draw another card while you are in ` +
          '**Literary Lockup**.\n\nUse `/jail` to review your release options.'
        )
        .setFooter({
          text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [jailEmbed],
        allowedMentions: {
          users: [],
        },
      });

      return;
    }

    // Check the draw cooldown.
    if (player.lastCardDraw) {
      const nextDrawTime = new Date(
        player.lastCardDraw.getTime() + DRAW_COOLDOWN
      );

      if (now < nextDrawTime) {
        const nextDrawTimestamp = Math.floor(
          nextDrawTime.getTime() / 1000
        );

        const cooldownEmbed = new EmbedBuilder()
          .setColor(0xf8d6e6)
          .setAuthor({
            name: 'Mrs. Bookopoly checks her watch...',
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTitle('⏳ The Deck Is Resting')
          .setDescription(
            `${interaction.user}, you have already drawn a card recently.\n\n` +
            `You may draw again <t:${nextDrawTimestamp}:R>.`
          )
          .setFooter({
            text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [cooldownEmbed],
          allowedMentions: {
            users: [],
          },
        });

        return;
      }
    }

    // Randomly select Chance or Community Chest.
    const isChance =
      Math.random() < CHANCE_CARD_PROBABILITY;

    const selectedDeck = isChance
      ? chanceCards
      : communityChestCards;

    const card = getRandomCard(selectedDeck);

    let resultText = '';
    let resultIcon = '🎩';
    let wasSentToJail = false;

    switch (card.effect.type) {
      case 'add_balance': {
        player.balance += card.effect.amount;

        resultIcon = '💰';
        resultText =
          `+${card.effect.amount.toLocaleString()} Baddie Bucks`;

        break;
      }

      case 'remove_balance': {
        const requestedAmount = card.effect.amount;

        const amountRemoved = Math.min(
          player.balance,
          requestedAmount
        );

        player.balance -= amountRemoved;
        resultIcon = '💸';

        if (amountRemoved === requestedAmount) {
          resultText =
            `-${amountRemoved.toLocaleString()} Baddie Bucks`;
        } else if (amountRemoved === 0) {
          resultText =
            'Your wallet was already empty. No Baddie Bucks were removed.';
        } else {
          resultText =
            `-${amountRemoved.toLocaleString()} Baddie Bucks ` +
            '(your remaining balance)';
        }

        break;
      }

      case 'add_jail_card': {
        const cardsAdded = card.effect.amount ?? 1;

        player.getOutOfJailCards += cardsAdded;

        resultIcon = '🔑';
        resultText =
          `Received ${cardsAdded} Get Out of Jail Free ` +
          `${cardsAdded === 1 ? 'card' : 'cards'}`;

        break;
      }
      
      case 'go_to_jail': {
        player.isInJail = true;
        player.jailReason = card.title;
        player.jailBookedAt = now;
        player.jailVisits = (player.jailVisits ?? 0) + 1;
        console.log('Jail visits:', player.jailVisits);

        await addLockupRole(interaction, interaction.user.id);

        wasSentToJail = true;
        resultIcon = '🚔';
        resultText = 'Sent directly to Literary Lockup';

        break;
      }

            case 'none': {
        resultIcon = '😐';
        resultText = 'Nothing happens. Mrs. Bookopoly simply waves you along.';

        break;
      }
      
      default: {
        console.error(
          `Unknown card effect type: ${card.effect.type}`
        );

        await interaction.editReply({
          content:
            'Mrs. Bookopoly encountered an error while processing that card.',
        });

        return;
      }
    }

    // Count the draw.
    player.cardsDrawn++;

    // Start the cooldown after a valid card is processed.
    player.lastCardDraw = now;

    await player.save();

    // Announce a new booking in the Literary Lockup channel.
    if (wasSentToJail) {
      try {
        await sendLockupAnnouncement(interaction, {
  title: '🚔 BOOKING REPORT',
  author:
    'Mrs. Bookopoly opens a new inmate file...',
  userId: interaction.user.id,
  description:
    `${interaction.user} has been escorted into **Literary Lockup**.\n\n` +
    `**📖 Offense**\n${player.jailReason}\n\n` +
    '**🔒 Current Status**\nHeld until bail is paid or a Get Out of Jail Free Card is used.',
  color: 0xc1121f,
});
      } catch (error) {
        console.error(
          'Error sending Literary Lockup booking announcement:',
          error
        );
      }
    }

    const deckDisplayName = isChance
      ? 'CHANCE'
      : 'COMMUNITY CHEST';

    const deckIcon = isChance
      ? '🎴'
      : '📦';

    const embedColor = isChance
      ? 0xf45aa5
      : 0xffd166;

    const cardEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: 'Mrs. Bookopoly draws a card...',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle(`${deckIcon} ${deckDisplayName}`)
      .setDescription(
        `${interaction.user} draws a card...\n\n` +
        `### ${card.title}\n` +
        `${card.description}`
      )
      .addFields(
        {
          name: `${resultIcon} Result`,
          value: resultText,
          inline: false,
        },
        {
          name: '💵 New Balance',
          value:
            `${player.balance.toLocaleString()} Baddie Bucks`,
          inline: true,
        },
        {
          name: '🔑 Jail Cards',
          value:
            `${player.getOutOfJailCards}`,
          inline: true,
        }
      )
      .setFooter({
        text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [cardEmbed],
      allowedMentions: {
        users: [],
      },
    });
  },
};