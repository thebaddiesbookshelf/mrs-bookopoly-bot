const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const Investigation = require('../../models/Investigation');
const Counter = require('../../models/Counter');
const { getRandomQuote } = require('../../utils/quotes');

const LITERARY_LOCKUP_CHANNEL_ID = '1499925731155644478';
const UNDER_INVESTIGATION_ROLE_ID = '1529717344799293561';

const REPORT_COOLDOWN = 8 * 60 * 60 * 1000; // 8 hours
const INVESTIGATION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

async function getNextCaseNumber(guildId) {
  const counter = await Counter.findOneAndUpdate(
    {
      guildId,
      name: 'investigationCase',
    },
    {
      $inc: {
        value: 1,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return counter.value;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription(
      'Submit an Investor Tip-Off about suspicious Bookopoly activity.'
    )
    .addUserOption((option) =>
      option
        .setName('suspect')
        .setDescription('The Investor you are reporting.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription(
          'Explain the suspicious activity or evidence.'
        )
        .setRequired(true)
        .setMinLength(10)
        .setMaxLength(6000)
    ),

  async execute(interaction) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (!interaction.guild) {
      await interaction.editReply({
        content:
          'Investor Tip-Offs can only be submitted inside the Bookopoly server.',
      });

      return;
    }

    const suspectUser =
      interaction.options.getUser('suspect', true);

    const reason =
      interaction.options.getString('reason', true).trim();

    const investorUser = interaction.user;
    const now = new Date();

    /*
     * Basic safeguards
     */

    if (suspectUser.id === investorUser.id) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly rejects the filing. You cannot submit an Investor Tip-Off against yourself.',
      });

      return;
    }

    if (suspectUser.bot) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly refuses to investigate another bot. Her jurisdiction covers Investors only.',
      });

      return;
    }

    /*
     * Find or create the Investor's player record.
     */

    let investor = await Player.findOne({
      guildId: interaction.guildId,
      userId: investorUser.id,
    });

    if (!investor) {
      investor = await Player.create({
        guildId: interaction.guildId,
        userId: investorUser.id,
        username: investorUser.username,
      });
    }

    investor.username = investorUser.username;

    /*
     * Check the Investor's eight-hour report cooldown.
     */

    if (investor.lastReportAt) {
      const nextReportTime = new Date(
        investor.lastReportAt.getTime() + REPORT_COOLDOWN
      );

      if (now < nextReportTime) {
        const nextReportTimestamp = Math.floor(
          nextReportTime.getTime() / 1000
        );

        await interaction.editReply({
          content:
            'Mrs. Bookopoly rejects the filing. You have already submitted ' +
            'an Investor Tip-Off recently.\n\n' +
            `You may open another investigation <t:${nextReportTimestamp}:R>.`,
        });

        return;
      }
    }

    /*
     * Find or create the suspect's player record.
     */

    let suspectPlayer = await Player.findOne({
      guildId: interaction.guildId,
      userId: suspectUser.id,
    });

    if (!suspectPlayer) {
      suspectPlayer = await Player.create({
        guildId: interaction.guildId,
        userId: suspectUser.id,
        username: suspectUser.username,
      });
    }

    suspectPlayer.username = suspectUser.username;

    /*
     * Do not investigate someone already incarcerated.
     */

    if (suspectPlayer.isInJail) {
      await interaction.editReply({
        content:
          'That Investor is already being held in Literary Lockup. ' +
          'Mrs. Bookopoly does not accept redundant paperwork.',
      });

      return;
    }

    /*
     * Only one open investigation per suspect.
     */

    const existingInvestigation =
      await Investigation.findOne({
        guildId: interaction.guildId,
        suspectId: suspectUser.id,
        status: 'open',
      });

    if (existingInvestigation) {
      const existingCaseNumber = String(
        existingInvestigation.caseNumber
      ).padStart(4, '0');

      await interaction.editReply({
        content:
          `${suspectUser} is already the subject of ` +
          `**Case File #${existingCaseNumber}**.\n\n` +
          'Mrs. Bookopoly does not accept duplicate tip-offs while an investigation is active.',
      });

      return;
    }

    /*
     * Confirm the channel and role exist.
     */

    const lockupChannel =
      await interaction.guild.channels.fetch(
        LITERARY_LOCKUP_CHANNEL_ID
      );

    if (!lockupChannel || !lockupChannel.isTextBased()) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly could not locate the Literary Lockup channel. Please notify the event host.',
      });

      return;
    }

    const investigationRole =
      await interaction.guild.roles.fetch(
        UNDER_INVESTIGATION_ROLE_ID
      );

    if (!investigationRole) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly could not locate the Under Investigation role. Please notify the event host.',
      });

      return;
    }

    /*
     * Resolve the suspect as a server member.
     */

    let suspectMember =
      interaction.options.getMember('suspect');

    if (!suspectMember) {
      try {
        suspectMember =
          await interaction.guild.members.fetch(
            suspectUser.id
          );
      } catch {
        await interaction.editReply({
          content:
            'Mrs. Bookopoly could not locate that Investor in this server.',
        });

        return;
      }
    }

    /*
     * Confirm Mrs. Bookopoly can manage the role.
     */

    const botMember = interaction.guild.members.me;

    if (
      !botMember ||
      !botMember.permissions.has(
        PermissionFlagsBits.ManageRoles
      )
    ) {
      await interaction.editReply({
        content:
          'Mrs. Bookopoly needs the **Manage Roles** permission before she can open investigations.',
      });

      return;
    }

    if (
      investigationRole.position >=
      botMember.roles.highest.position
    ) {
      await interaction.editReply({
        content:
          'The Under Investigation role must be positioned below Mrs. Bookopoly’s highest role.',
      });

      return;
    }

    /*
     * Prepare the case.
     */

    const caseNumber =
      await getNextCaseNumber(interaction.guildId);

    const formattedCaseNumber =
      String(caseNumber).padStart(4, '0');

    const expiresAt = new Date(
      now.getTime() + INVESTIGATION_DURATION
    );

    const expiresTimestamp = Math.floor(
      expiresAt.getTime() / 1000
    );

    let investigation = null;
    let roleAdded = false;

    try {
      investigation = await Investigation.create({
        guildId: interaction.guildId,
        caseNumber,

        suspectId: suspectUser.id,
        suspectUsername: suspectUser.username,

        investorId: investorUser.id,
        investorUsername: investorUser.username,

        reason,

        status: 'open',

        openedAt: now,
        expiresAt,

        defenseSubmitted: false,
        defenseText: null,
        defenseSubmittedAt: null,

        channelId: lockupChannel.id,
      });

      await suspectMember.roles.add(
        investigationRole,
        `Bookopoly investigation Case File #${formattedCaseNumber}`
      );

      roleAdded = true;

      const caseEmbed = new EmbedBuilder()
        .setColor(0xf4a6c1)
        .setAuthor({
          name:
            'Mrs. Bookopoly opens a confidential case file...',
          iconURL:
            interaction.client.user.displayAvatarURL(),
        })
        .setTitle(
          `🕵️ BOOKOPOLY INVESTIGATIONS BUREAU`
        )
        .setDescription(
          `## 📂 CASE FILE #${formattedCaseNumber}\n\n` +
          `An Investor Tip-Off has triggered an official investigation.`
        )
        .addFields(
          {
            name: '🔎 Suspect',
            value: `<@${suspectUser.id}>`,
            inline: true,
          },
          {
            name: '💼 Investor',
            value: `<@${investorUser.id}>`,
            inline: true,
          },
          {
            name: '📑 Suspicious Activity Reported',
            value: `> ${reason}`,
            inline: false,
          },
          {
            name: '⏳ Investigation Status',
            value:
              '**UNDER INVESTIGATION**\n\n' +
              `The suspect has until <t:${expiresTimestamp}:F> ` +
              `(<t:${expiresTimestamp}:R>) to defend themselves.\n\n` +
              'Use `/defend` to submit an official statement before the deadline.',
            inline: false,
          },
          {
            name: '📚 Evidence Review',
            value:
              'Mrs. Bookopoly will review:\n' +
              '• Official Book Log records\n' +
              '• The suspect’s submitted defense\n' +
              '• The evidence provided by the Investor',
            inline: false,
          }
        )
        .setFooter({
          text:
            `Case File #${formattedCaseNumber} • ` +
            `“${getRandomQuote()}” — Mrs. Bookopoly`,
        })
        .setTimestamp();

      const caseMessage = await lockupChannel.send({
        content: `<@${suspectUser.id}>`,
        embeds: [caseEmbed],
        allowedMentions: {
          users: [suspectUser.id],
        },
      });

      investigation.messageId = caseMessage.id;

      await investigation.save();

      investor.lastReportAt = now;

      await investor.save();
      await suspectPlayer.save();

      await interaction.editReply({
        content:
          `📂 **Investor Tip-Off accepted.**\n\n` +
          `Mrs. Bookopoly has opened **Case File #${formattedCaseNumber}** ` +
          `against ${suspectUser}. The investigation has been forwarded to ` +
          `<#${LITERARY_LOCKUP_CHANNEL_ID}>.`,
      });
    } catch (error) {
      console.error(
        'Error creating Bookopoly investigation:',
        error
      );

      /*
       * Roll back incomplete cases.
       */

      if (investigation?._id) {
        await Investigation.deleteOne({
          _id: investigation._id,
        }).catch((cleanupError) => {
          console.error(
            'Failed to remove incomplete investigation:',
            cleanupError
          );
        });
      }

      if (roleAdded) {
        await suspectMember.roles
          .remove(
            investigationRole,
            'Investigation creation failed'
          )
          .catch((cleanupError) => {
            console.error(
              'Failed to remove investigation role:',
              cleanupError
            );
          });
      }

      await interaction.editReply({
        content:
          'Mrs. Bookopoly encountered an error while opening that case file. No report cooldown was applied.',
      });
    }
  },
};