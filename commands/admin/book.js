const {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const {
  sendLockupAnnouncement,
} = require('../../utils/lockupAnnouncements');
const { addLockupRole } = require('../../utils/lockupRole');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('book')
    .setDescription('Book a reader into Literary Lockup.')
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('The reader being booked.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Why the reader is being booked.')
        .setMaxLength(500)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.options.getUser(
      'member',
      true
    );

    const providedReason =
      interaction.options.getString('reason');

    const reason =
      providedReason?.trim() ||
      'Suspicious Reading Activity';

    if (member.bot) {
      return interaction.editReply({
        content:
          '❌ Mrs. Bookopoly cannot book another bot into Literary Lockup.',
      });
    }

    let player = await Player.findOne({
      guildId: interaction.guildId,
      userId: member.id,
    });

    if (!player) {
      player = await Player.create({
        guildId: interaction.guildId,
        userId: member.id,
        username: member.username,
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

    if (player.isInJail) {
      const alreadyBookedEmbed = new EmbedBuilder()
        .setColor(0xC1121F)
        .setTitle('🚔 Already in Literary Lockup')
        .setDescription(
          `${member} is already serving time in **Literary Lockup**.`
        )
        .addFields({
          name: '📖 Current Offense',
          value: player.jailReason ?? 'Unknown',
        });

      return interaction.editReply({
        embeds: [alreadyBookedEmbed],
      });
    }

    player.username = member.username;
    player.isInJail = true;
    player.jailVisits = (player.jailVisits ?? 0) + 1;
    player.jailReason =
      `Administrative Booking — ${reason}`;
    player.jailBookedAt = new Date();

    await player.save();
    await addLockupRole(interaction, member.id);
    try {
      await sendLockupAnnouncement(interaction, {
    title: '🚔 BOOKING REPORT',
    author:
        'Mrs. Bookopoly opens a new inmate file...',
    color: 0xC1121F,
    userId: member.id,
    description:
        `${member} has officially been booked into **Literary Lockup**.\n\n` +
        `**Reason:**\n${reason}`,
});
    } catch (error) {
      console.error(
        'Failed to send Literary Lockup booking announcement:',
        error
      );
    }

    const successEmbed = new EmbedBuilder()
      .setColor(0xF45AA5)
      .setTitle('✅ Reader Booked')
      .setDescription(
        `${member} has been booked into **Literary Lockup**.`
      )
      .addFields({
        name: '📖 Reason',
        value: reason,
      })
      .setFooter({
        text: 'Administrative booking completed.',
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [successEmbed],
    });
  },
};
