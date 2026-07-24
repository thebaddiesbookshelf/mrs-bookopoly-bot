const {
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');

const {
  propertySets,
} = require('../../data/properties');

const { getRandomQuote } = require('../../utils/quotes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wallet')
    .setDescription('View your current Baddie Bucks balance.'),

  async execute(interaction) {
    const player = await Player.findOneAndUpdate(
      {
        guildId: interaction.guildId,
        userId: interaction.user.id,
      },
      {
        $set: {
          username: interaction.user.username,
        },
        $setOnInsert: {
          balance: 0,
          properties: [],
          completedSets: [],
          getOutOfJailCards: 0,
          cardsDrawn: 0,
          jailVisits: 0,
          isInJail: false,
          lastCardDraw: null,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    const status = player.isInJail
      ? '🚔 In Literary Lockup'
      : '🚶‍♀️ Free to Roam';

      const ownedProperties = player.properties ?? [];

const completedSetCount = propertySets.filter((set) => {
  return (
    set.properties?.length > 0 &&
    set.properties.every((setProperty) =>
      ownedProperties.includes(setProperty.id)
    )
  );
}).length;

    const walletEmbed = new EmbedBuilder()
      .setColor(0xF45AA5)
      .setAuthor({
        name: 'Mrs. Bookopoly opens her ledger...',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle(`${interaction.user.displayName} • Wallet`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(
        `**Welcome back, Investor!**\n\n` +
        `Mrs. Bookopoly has reviewed your accounts. Here's your current portfolio:\n\n` +
        `## 💵 ${player.balance.toLocaleString()} Baddie Bucks`
      )
      .addFields(
  {
    name: '🏡 Owned Properties',
    value: `${player.properties.length}`,
    inline: true,
  },
  {
    name: '🎨 Completed Sets',
  value: `${completedSetCount}`,
  inline: true,
  },
  {
    name: '🎴 Cards Drawn',
    value: `${player.cardsDrawn ?? 0}`,
    inline: true,
  },
  {
    name: '🚔 Jail Visits',
    value: `${player.jailVisits ?? 0}`,
    inline: true,
  },
  {
    name: '🔓 Jail-Free Cards',
    value: `${player.getOutOfJailCards}`,
    inline: true,
  },
  {
    name: '🚨 Status',
    value: status,
    inline: true,
  }
)
      .setFooter({
  text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
})
      .setTimestamp();

    await interaction.reply({
      embeds: [walletEmbed],
    });
  },
};