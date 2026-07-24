const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const {
  properties,
  propertySets,
  getPropertyById,
} = require('../../data/properties');

const LEADERBOARD_CONFIG = {
  balance: {
    title: '💰 Richest Players',
    color: 0xf2c94c,
    description: 'Players ranked by their current Baddie Bucks balance.',
    getScore: (player) => player.balance ?? 0,
    formatScore: (score) => `💰 **${score.toLocaleString()} BB**`,
  },

  properties: {
    title: '🏡 Property Tycoons',
    color: 0xf45aa5,
    description: 'Players ranked by the number of properties they own.',
    getScore: (player) => player.properties?.length ?? 0,
    formatScore: (score) =>
      `🏡 **${score.toLocaleString()} / ${properties.length} Properties**`,
  },

  collections: {
    title: '👑 Collection Masters',
    color: 0x8e5bb7,
    description: 'Players ranked by the number of completed property sets.',
    getScore: (player) => player.completedSets?.length ?? 0,
    formatScore: (score) =>
      `👑 **${score.toLocaleString()} / ${propertySets.length} Collections**`,
  },

  portfolio: {
    title: '💎 Highest Portfolio Value',
    color: 0x2aa198,
    description:
      'Players ranked by the combined reward value of every property they own.',
    getScore: (player) => calculatePortfolioValue(player.properties),
    formatScore: (score) => `💎 **${score.toLocaleString()} BB**`,
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bookopoly')
    .setDescription('View Bookopoly information and rankings.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('leaderboard')
        .setDescription('View a Bookopoly leaderboard.')
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('Choose which leaderboard to view.')
            .setRequired(true)
            .addChoices(
              {
                name: '💰 Richest Players',
                value: 'balance',
              },
              {
                name: '🏡 Property Tycoons',
                value: 'properties',
              },
              {
                name: '👑 Collection Masters',
                value: 'collections',
              },
              {
                name: '💎 Highest Portfolio Value',
                value: 'portfolio',
              }
            )
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'leaderboard') {
      return handleLeaderboard(interaction);
    }
  },
};

async function handleLeaderboard(interaction) {
  await interaction.deferReply();

  try {
    const category = interaction.options.getString('category');
    const config = LEADERBOARD_CONFIG[category];

    if (!config) {
      return interaction.editReply({
        content: '❌ That leaderboard category could not be found.',
      });
    }

    const players = await Player.find({
      guildId: interaction.guildId,
    }).lean();

    const rankedPlayers = players
      .map((player) => ({
        ...player,
        score: config.getScore(player),
      }))
      .filter((player) => player.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return (a.username ?? '').localeCompare(b.username ?? '');
      });

    if (rankedPlayers.length === 0) {
      const emptyEmbed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle(config.title)
        .setDescription(
          'No players have earned a place on this leaderboard yet.'
        )
        .setTimestamp();

      return interaction.editReply({
        embeds: [emptyEmbed],
      });
    }

    assignCompetitionRanks(rankedPlayers);

    const topPlayers = rankedPlayers.slice(0, 10);

    const leaderboardLines = topPlayers.map((player) => {
      const rankDisplay = getRankDisplay(player.rank);
      const displayName = escapeMarkdown(
        player.username || `Player ${player.userId}`
      );

      return (
        `${rankDisplay} **${displayName}**\n` +
        `${config.formatScore(player.score)}`
      );
    });

    const leaderboardEmbed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(config.title)
      .setDescription(
        `${config.description}\n\n${leaderboardLines.join('\n\n')}`
      )
      .setTimestamp();

    const invokingPlayer = rankedPlayers.find(
      (player) => player.userId === interaction.user.id
    );

    if (invokingPlayer) {
      leaderboardEmbed.addFields({
        name: '📍 Your Rank',
        value:
          `**#${invokingPlayer.rank}** out of ` +
          `**${rankedPlayers.length}** ranked players\n` +
          config.formatScore(invokingPlayer.score),
        inline: false,
      });
    } else {
      leaderboardEmbed.addFields({
        name: '📍 Your Rank',
        value: 'You are not ranked in this category yet.',
        inline: false,
      });
    }

    const firstPlaceUser = await interaction.client.users
      .fetch(topPlayers[0].userId)
      .catch(() => null);

    if (firstPlaceUser) {
      leaderboardEmbed.setThumbnail(
        firstPlaceUser.displayAvatarURL({
          size: 256,
        })
      );
    }

    leaderboardEmbed.setFooter({
      text: `Showing the Top ${topPlayers.length} of ${rankedPlayers.length} ranked players`,
    });

    return interaction.editReply({
      embeds: [leaderboardEmbed],
    });
  } catch (error) {
    console.error('Error viewing Bookopoly leaderboard:', error);

    return interaction.editReply({
      content:
        '❌ Something went wrong while opening the Bookopoly leaderboard.',
    });
  }
}

function calculatePortfolioValue(ownedPropertyIds = []) {
  return ownedPropertyIds.reduce((total, propertyId) => {
    const property = getPropertyById(propertyId);
    return total + (property?.reward ?? 0);
  }, 0);
}

function assignCompetitionRanks(players) {
  let previousScore = null;
  let currentRank = 0;

  players.forEach((player, index) => {
    if (player.score !== previousScore) {
      currentRank = index + 1;
      previousScore = player.score;
    }

    player.rank = currentRank;
  });
}

function getRankDisplay(rank) {
  const rankEmojis = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣',
    10: '🔟',
  };

  return rankEmojis[rank] ?? `**#${rank}**`;
}

function escapeMarkdown(text) {
  return String(text).replace(/([\\`*_{}\[\]()#+\-.!|>~])/g, '\\$1');
}