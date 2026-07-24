const {
  EmbedBuilder,
} = require('discord.js');

const Player = require('../models/Player');
const { getRandomQuote } = require('../utils/quotes');
const {
  sendLockupAnnouncement,
} = require('../utils/lockupAnnouncements');
const { removeLockupRole } = require('../utils/lockupRole');
module.exports = async function handleJailButtons(interaction) {
  const validButtonIds = [
    'jail_use_card',
    'jail_pay_bail',
    'jail_read_pages',
  ];

  if (!validButtonIds.includes(interaction.customId)) {
    return;
  }

  const player = await Player.findOne({
    guildId: interaction.guildId,
    userId: interaction.user.id,
  });

  if (!player) {
    await interaction.reply({
      content:
        'Mrs. Bookopoly could not find your player record.',
      ephemeral: true,
    });

    return;
  }

  if (!player.isInJail) {
    await interaction.reply({
      content:
        'You are no longer in Literary Lockup! Run `/jail` to view your current status.',
      ephemeral: true,
    });

    return;
  }

  const jailReason =
    player.jailReason || 'An unspecified literary offense';

  // Release the player using a Get Out of Jail Free Card.
  if (interaction.customId === 'jail_use_card') {
    if (player.getOutOfJailCards <= 0) {
      await interaction.reply({
        content:
          'You do not have a Get Out of Jail Free Card.',
        ephemeral: true,
      });

      return;
    }

    player.getOutOfJailCards -= 1;
    player.isInJail = false;
    player.jailReason = null;
    player.jailBookedAt = null;

    await player.save();
    await removeLockupRole(interaction, interaction.user.id);

    const releaseEmbed = new EmbedBuilder()
      .setColor(0x2e8b57)
      .setAuthor({
        name: 'Mrs. Bookopoly approves your release...',
        iconURL:
          interaction.client.user.displayAvatarURL(),
      })
      .setTitle('🔓 Released from Literary Lockup')
      .setDescription(
        '🗝️ Mrs. Bookopoly examines your card, nods once, and unlocks the gate.\n\n' +
        '**“Looks like your paperwork checks out.”**'
      )
      .addFields(
        {
          name: '🗝️ Release Method',
          value: 'Get Out of Jail Free Card',
          inline: true,
        },
        {
          name: '🎟️ Cards Remaining',
          value: `${player.getOutOfJailCards}`,
          inline: true,
        }
      )
      .setFooter({
        text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
      })
      .setTimestamp();

    await interaction.update({
      embeds: [releaseEmbed],
      components: [],
    });

    await sendLockupAnnouncement(interaction, {
  title: '📋 RELEASE REPORT',
  author: 'Mrs. Bookopoly stamps the release paperwork...',
  userId: interaction.user.id,
  description:
    `${interaction.user} has been released from **Literary Lockup**.\n\n` +
    `**📖 Original Offense**\n${jailReason}\n\n` +
    '**🗝️ Release Method**\nGet Out of Jail Free Card',
  color: 0x2e8b57,
});

    return;
  }

  // Release the player after paying bail.
  if (interaction.customId === 'jail_pay_bail') {
    const bailAmount = 250;

    if (player.balance < bailAmount) {
      await interaction.reply({
        content:
          `You need ${bailAmount} BB to pay your release fee, but you only have ${player.balance.toLocaleString()} BB.`,
        ephemeral: true,
      });

      return;
    }

    player.balance -= bailAmount;
    player.isInJail = false;
    player.jailReason = null;
    player.jailBookedAt = null;

    await player.save();
    await removeLockupRole(interaction, interaction.user.id);

    const releaseEmbed = new EmbedBuilder()
      .setColor(0x2e8b57)
      .setAuthor({
        name: 'Mrs. Bookopoly approves your release...',
        iconURL:
          interaction.client.user.displayAvatarURL(),
      })
      .setTitle('🔓 Released from Literary Lockup')
      .setDescription(
        '💸 Mrs. Bookopoly counts every last Baddie Buck before opening the gate.\n\n' +
        '**“Money talks.”**'
      )
      .addFields(
        {
          name: '💸 Release Method',
          value: `Paid ${bailAmount} BB`,
          inline: true,
        },
        {
          name: '💵 New Balance',
          value: `${player.balance.toLocaleString()} BB`,
          inline: true,
        }
      )
      .setFooter({
        text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
      })
      .setTimestamp();

    await interaction.update({
      embeds: [releaseEmbed],
      components: [],
    });

    await sendLockupAnnouncement(interaction, {
  title: '📋 RELEASE REPORT',
  author: 'Mrs. Bookopoly stamps the release paperwork...',
  userId: interaction.user.id,
  description:
    `${interaction.user} has been released from **Literary Lockup**.\n\n` +
    `**📖 Original Offense**\n${jailReason}\n\n` +
    `**💸 Release Method**\nPaid ${bailAmount} Baddie Bucks`,
  color: 0x2e8b57,
});

    return;
  }

  // Read to be Released from Literary Lockup.
  if (interaction.customId === 'jail_read_pages') {
  return interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setColor(0xF4A261)
        .setTitle('📖 Reading Release')
        .setDescription(
          'Want to earn your freedom through reading?\n\n' +
          '**Read at least 25 pages** of any book, then post your proof in this channel and @ Angel.\n\n' +
          'Once Angel verifies your progress, she will officially release you from Literary Lockup!'
      )
      .addFields({
        name: '📖 Offense',
        value: jailReason,
      })
          .setFooter({
          text: 'Mrs. Bookopoly accepts reading as community service.',
        })
    ],
  });
    await interaction.update({
      embeds: [waitingEmbed],
      components: [],
    });
  }
};