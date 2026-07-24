const { EmbedBuilder } = require('discord.js');

const Investigation = require('../models/Investigation');
const Player = require('../models/Player');

const UNDER_INVESTIGATION_ROLE_ID =
  '1529717344799293561';

const LITERARY_LOCKUP_ROLE_ID =
  '1528701892614422660'; 

const { getRandomQuote } = require('./quotes');

module.exports = async function resolveInvestigation(
  client,
  investigation
) {
  if (!investigation || investigation.status !== 'open') return;

  const guild = client.guilds.cache.get(investigation.guildId);

  if (!guild) return;

  const member = await guild.members
    .fetch(investigation.suspectId)
    .catch(() => null);

  const player = await Player.findOne({
    guildId: investigation.guildId,
    userId: investigation.suspectId,
  });

  const booksLogged = player?.booksLogged > 0;
  const defended = investigation.defenseSubmitted;

  let dismissalChance = 35;

  if (booksLogged && defended)
    dismissalChance = 70;
  else if (booksLogged)
    dismissalChance = 55;
  else if (defended)
    dismissalChance = 50;

  const roll = Math.floor(Math.random() * 100) + 1;

  const dismissed = roll <= dismissalChance;

  investigation.dismissalChance = dismissalChance;
investigation.verdictRoll = roll;
investigation.status = dismissed
  ? 'dismissed'
  : 'guilty';
investigation.verdictIssuedAt = new Date();

await investigation.save();

  const channel = await guild.channels
    .fetch(investigation.channelId)
    .catch(() => null);

  if (!channel || !channel.isTextBased()) return;

  if (member) {
    await member.roles
      .remove(UNDER_INVESTIGATION_ROLE_ID)
      .catch(() => {});

      if (dismissed && player) {
  player.isInJail = false;
  player.jailReason = null;
  player.jailBookedAt = null;

  await player.save();
}

    if (!dismissed) {
  await member.roles
    .add(LITERARY_LOCKUP_ROLE_ID)
    .catch(() => {});

  if (player) {
    player.isInJail = true;
    player.jailReason = `Found guilty in Case File #${String(
      investigation.caseNumber
    ).padStart(4, '0')}`;
    player.jailBookedAt = new Date();
    player.jailVisits = (player.jailVisits || 0) + 1;

    await player.save();
  }
}
  }

  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter({
      text: `Case File #${String(
        investigation.caseNumber
      ).padStart(4, '0')} • "${getRandomQuote()}"`,
    });

  if (dismissed) {
    embed
      .setColor(0x57f287)
      .setTitle('⚖️ CASE DISMISSED')
      .setDescription(
        `## 📂 CASE FILE #${String(
          investigation.caseNumber
        ).padStart(4, '0')}\n\n` +
          `<@${investigation.suspectId}> has been **CLEARED**.\n\n` +
          `Mrs. Bookopoly reviewed the evidence and found insufficient grounds to issue a conviction.`
      );
  } else {
    embed
      .setColor(0xed4245)
      .setTitle('🚔 GUILTY')
      .setDescription(
        `## 📂 CASE FILE #${String(
          investigation.caseNumber
        ).padStart(4, '0')}\n\n` +
          `<@${investigation.suspectId}> has been found **GUILTY**.\n\n` +
          `Mrs. Bookopoly has ordered the suspect transferred to Literary Lockup.`
      );
  }

  embed.addFields(
    {
      name: '📚 Books Logged',
      value: booksLogged ? '✅ Yes' : '❌ No',
      inline: true,
    },
    {
      name: '🗣 Defense Filed',
      value: defended ? '✅ Yes' : '❌ No',
      inline: true,
    },
    {
      name: '🎲 Dismissal Chance',
      value: `${dismissalChance}%`,
      inline: true,
    }
  );

  await channel.send({
    embeds: [embed],
  });
};