const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const { getRandomQuote } = require('../../utils/quotes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail')
    .setDescription('Review your Literary Lockup status.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

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
    await player.save();

    if (!player.isInJail) {
      const freeEmbed = new EmbedBuilder()
        .setColor(0xF45AA5)
        .setAuthor({
          name: 'Mrs. Bookopoly checks the records...',
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTitle('🩷 Freedom Looks Good on You')
        .setDescription(
          'Good news! You are **not currently staying in Literary Lockup.**\n\n' +
          'Feel free to continue drawing cards, collecting properties, and building your Bookopoly empire.'
        )
        .setFooter({
          text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
        });

      return interaction.editReply({
        embeds: [freeEmbed],
      });
    }

    const inmateCount = await Player.countDocuments({
      guildId: interaction.guildId,
      isInJail: true,
    });

    const bookedTimestamp = player.jailBookedAt
      ? `<t:${Math.floor(player.jailBookedAt.getTime() / 1000)}:f>`
      : 'Unknown';

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('jail_use_card')
        .setLabel('Use Jail Card')
        .setEmoji('🗝️')
        .setStyle(ButtonStyle.Success)
        .setDisabled(player.getOutOfJailCards <= 0),

      new ButtonBuilder()
        .setCustomId('jail_pay_bail')
        .setLabel('Pay 250 BB')
        .setEmoji('💸')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(player.balance < 250),

      new ButtonBuilder()
        .setCustomId('jail_read_pages')
        .setLabel('Read 25 Pages')
        .setEmoji('📖')
        .setStyle(ButtonStyle.Secondary)
    );

    const jailEmbed = new EmbedBuilder()
      .setColor(0xC1121F)
      .setAuthor({
        name: 'Mrs. Bookopoly reviews your inmate file...',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle('🚔 Literary Lockup')
      .setDescription(
        '"Rules exist for a reason."\n\n' +
        'You are currently serving time in **Literary Lockup.**'
      )
      .addFields(
        {
          name: '📖 Offense',
          value: player.jailReason ?? 'Unknown',
          inline: false,
        },
        {
          name: '🕒 Booked',
          value: bookedTimestamp,
          inline: true,
        },
        {
          name: '👥 Current Occupants',
          value: `${inmateCount}`,
          inline: true,
        },
        {
          name: '💰 Wallet',
          value: `${player.balance.toLocaleString()} BB`,
          inline: true,
        },
        {
          name: '🗝️ Jail Cards',
          value: `${player.getOutOfJailCards}`,
          inline: true,
        }
      )
      .setFooter({
        text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
      });

    await interaction.editReply({
      embeds: [jailEmbed],
      components: [row],
    });
  },
}