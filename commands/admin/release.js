const {
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const {
  sendLockupAnnouncement,
} = require('../../utils/lockupAnnouncements');
const { removeLockupRole } = require('../../utils/lockupRole');
const { isMayor } = require('../../utils/isMayor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release a reader from Literary Lockup.')
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('The reader being released.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Why the reader is being released.')
        .setMaxLength(500)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!(await isMayor(interaction))) return;

    await interaction.deferReply({ ephemeral: true });

    const member = interaction.options.getUser(
      'member',
      true
    );

    const providedReason =
      interaction.options.getString('reason');

    const reason =
      providedReason?.trim() ||
      'Administrative Release';

    const player = await Player.findOne({
      guildId: interaction.guildId,
      userId: member.id,
    });

    if (!player || !player.isInJail) {
      const notJailedEmbed = new EmbedBuilder()
        .setColor(0xF45AA5)
        .setTitle('🩷 Reader Is Already Free')
        .setDescription(
          `${member} is not currently serving time in **Literary Lockup**.`
        );

      return interaction.editReply({
        embeds: [notJailedEmbed],
      });
    }

    player.username = member.username;
    player.isInJail = false;
    player.jailReason = null;
    player.jailBookedAt = null;

    await player.save();
    await removeLockupRole(interaction, member.id);

    try {
      await sendLockupAnnouncement(interaction, {
    title: '🔓 RELEASE REPORT',
    author:
        'Mrs. Bookopoly closes an inmate file...',
    color: 0x2E8B57,
    userId: member.id,
    description:
        `${member} has officially been released from **Literary Lockup**.\n\n` +
        `**Reason:**\n${reason}`,
});
    } catch (error) {
      console.error(
        'Failed to send Literary Lockup release announcement:',
        error
      );
    }

    const successEmbed = new EmbedBuilder()
      .setColor(0xF45AA5)
      .setTitle('✅ Reader Released')
      .setDescription(
        `${member} has been released from **Literary Lockup**.`
      )
      .addFields({
        name: '📖 Reason',
        value: reason,
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [successEmbed],
    });
  },
};
