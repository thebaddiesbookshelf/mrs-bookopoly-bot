const {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require('discord.js');

const Investigation = require('../../models/Investigation');
const resolveInvestigation = require('../../utils/resolveInvestigation');
const { getRandomQuote } = require('../../utils/quotes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('defend')
    .setDescription(
      'Submit your official defense for an active Bookopoly investigation.'
    )
    .addStringOption((option) =>
      option
        .setName('statement')
        .setDescription('Enter your official defense statement.')
        .setRequired(true)
        .setMaxLength(6000)
    ),

  async execute(interaction) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (!interaction.guild) {
      await interaction.editReply({
        content:
          'Defense statements can only be submitted inside the Bookopoly server.',
      });

      return;
    }

    const statement = interaction.options
      .getString('statement', true)
      .trim();

    const now = new Date();

    const investigation = await Investigation.findOne({
      guildId: interaction.guildId,
      suspectId: interaction.user.id,
      status: 'open',
    });

    if (!investigation) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly could not locate an active investigation against you.',
      });

      return;
    }

    const formattedCaseNumber = String(
      investigation.caseNumber
    ).padStart(4, '0');

    if (now >= investigation.expiresAt) {
      await interaction.editReply({
        content:
          `The defense deadline for **Case File #${formattedCaseNumber}** has already passed. ` +
          'Mrs. Bookopoly is preparing the final verdict.',
      });

      return;
    }

    if (investigation.defenseSubmitted) {
      await interaction.editReply({
        content:
          `You have already submitted a defense for **Case File #${formattedCaseNumber}**. ` +
          'Mrs. Bookopoly does not accept amended testimony.',
      });

      return;
    }

    const lockupChannel = await interaction.guild.channels
      .fetch(investigation.channelId)
      .catch(() => null);

    if (!lockupChannel || !lockupChannel.isTextBased()) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly could not locate the Literary Lockup channel. Please notify the event host.',
      });

      return;
    }

    investigation.defenseSubmitted = true;
    investigation.defenseText = statement;
    investigation.defenseSubmittedAt = now;

    await investigation.save();

    const defenseEmbed = new EmbedBuilder()
      .setColor(0x8ecae6)
      .setAuthor({
        name: 'Mrs. Bookopoly adds new testimony to the file...',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle('📜 OFFICIAL DEFENSE FILED')
      .setDescription(
        `## 📂 CASE FILE #${formattedCaseNumber}\n\n` +
        `<@${interaction.user.id}> has submitted an official statement.`
      )
      .addFields(
        {
          name: '🗣️ Defense Statement',
          value: statement,
          inline: false,
        },
        {
          name: '⏳ Case Status',
          value:
            '**UNDER INVESTIGATION**\n\n' +
            'Mrs. Bookopoly will review this testimony alongside the available evidence before issuing a verdict.',
          inline: false,
        }
      )
      .setFooter({
        text:
          `Case File #${formattedCaseNumber} • ` +
          `“${getRandomQuote()}” — Mrs. Bookopoly`,
      })
      .setTimestamp();

    try {
      await lockupChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [defenseEmbed],
        allowedMentions: {
          users: [interaction.user.id],
        },
      });
    } catch (error) {
      console.error(
        'Error posting investigation defense:',
        error
      );

      

      investigation.defenseSubmitted = false;
      investigation.defenseText = null;
      investigation.defenseSubmittedAt = null;

      await investigation.save();

      await interaction.editReply({
        content:
          'Mrs. Bookopoly could not file your defense in Literary Lockup. Please try again.',
      });

      return;
    }

    await resolveInvestigation(
  interaction.client,
  investigation
);

await interaction.editReply({
  content:
    `📜 Your official defense has been filed for ` +
    `**Case File #${formattedCaseNumber}**.\n\n` +
    'Mrs. Bookopoly has reviewed the case and issued a final verdict in Literary Lockup.',
});

    await interaction.editReply({
      content:
        `📜 Your official defense has been filed for ` +
        `**Case File #${formattedCaseNumber}**.\n\n` +
        'Mrs. Bookopoly will consider your statement when issuing the final verdict.',
    });
  },
};