const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const Player = require('../../models/Player');
const { isMayor } = require('../../utils/isMayor');

const {
  properties,
  getPropertyById,
  getPropertiesBySetId,
} = require('../../data/properties');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('propertyadmin')
    .setDescription('Manage Bookopoly player properties.')

    .addSubcommand((subcommand) =>
      subcommand
        .setName('give')
        .setDescription('Award a property to a player.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription(
              'The member receiving the property.'
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('property')
            .setDescription(
              'The property being awarded.'
            )
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName('book')
            .setDescription(
              'The book used to complete the requirement.'
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName('note')
            .setDescription(
              'An optional staff note.'
            )
            .setRequired(false)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a property from a player.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription(
              'The member losing the property.'
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('property')
            .setDescription(
              'The property to remove.'
            )
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction) {
    try {
      const focusedValue = interaction.options
        .getFocused()
        .toLowerCase();

      const matchingProperties = properties
        .filter((property) => {
          return (
            property.name
              .toLowerCase()
              .includes(focusedValue) ||
            property.setName
              .toLowerCase()
              .includes(focusedValue) ||
            property.id
              .toLowerCase()
              .includes(focusedValue)
          );
        })
        .slice(0, 25);

      return interaction.respond(
        matchingProperties.map((property) => ({
          name:
            `${property.setEmoji} ${property.name}` +
            ` — ${property.setName}`,
          value: property.id,
        }))
      );
    } catch (error) {
      console.error(
        'Property admin autocomplete error:',
        error
      );

      if (!interaction.responded) {
        await interaction.respond([]);
      }
    }
  },

  async execute(interaction) {
      if (!(await isMayor(interaction))) return;
    const subcommand =
      interaction.options.getSubcommand();

    switch (subcommand) {
      case 'give':
        return handlePropertyGive(interaction);

      case 'remove':
        return handlePropertyRemove(interaction);

      default:
        return;
    }
  },
};

async function handlePropertyGive(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  try {
    const member = interaction.options.getUser('member');
    const propertyId =
      interaction.options.getString('property');
    const book = interaction.options.getString('book');
    const note = interaction.options.getString('note');

    const property = getPropertyById(propertyId);

    if (!property) {
      return interaction.editReply({
        content:
          '❌ I could not find that property in the property catalog.',
      });
    }

    let player = await Player.findOne({
      guildId: interaction.guildId,
      userId: member.id,
    });

    if (!player) {
      player = new Player({
        guildId: interaction.guildId,
        userId: member.id,
        username: member.username,
      });
    }

    player.username = member.username;
    player.properties ??= [];
    player.completedSets ??= [];
    player.earnedSetBonuses ??= [];

    if (player.properties.includes(property.id)) {
      return interaction.editReply({
        content: `❌ ${member} already owns **${property.name}**.`,
      });
    }

    player.properties.push(property.id);
    player.balance += property.reward;

    const setProperties = getPropertiesBySetId(
      property.setId
    );

    const ownsFullSet = setProperties.every(
      (setProperty) =>
        player.properties.includes(setProperty.id)
    );

    const alreadyCompletedSet =
  player.completedSets.includes(property.setId);

const alreadyEarnedBonus =
  player.earnedSetBonuses.includes(property.setId);

let completedSet = false;
let awardedBonus = false;

if (ownsFullSet) {

  if (!alreadyCompletedSet) {
    player.completedSets.push(property.setId);
    completedSet = true;
  }

  if (!alreadyEarnedBonus) {
    player.balance += property.setBonus;
    player.earnedSetBonuses.push(property.setId);
    awardedBonus = true;
  }

}

    await player.save();

    const rarityDisplay = getRarityDisplay(
      property.rarity
    );

    const propertyEmbed = new EmbedBuilder()
      .setColor(property.setColor)
      .setTitle('🏡 Property Deed Issued')
      .setDescription(
        `${member} has obtained **${property.name}**!`
      )
      .addFields(
        {
          name: 'Collection',
          value: `${property.setEmoji} ${property.setName}`,
          inline: true,
        },
        {
          name: 'Rarity',
          value: `${rarityDisplay.emoji} ${property.rarity}`,
          inline: true,
        },
        {
          name: 'Property Reward',
          value: `💰 ${property.reward.toLocaleString()} BB`,
          inline: true,
        }
      );

    if (book) {
      propertyEmbed.addFields({
        name: 'Book',
        value: book,
        inline: false,
      });
    }

    if (note) {
      propertyEmbed.addFields({
        name: 'Staff Note',
        value: note,
        inline: false,
      });
    }

    const ownedInSet = setProperties.filter(
      (setProperty) =>
        player.properties.includes(setProperty.id)
    ).length;

    propertyEmbed.addFields({
      name: 'Collection Progress',
      value: `${ownedInSet}/${setProperties.length} properties collected`,
      inline: false,
    });

    if (awardedBonus) {
      propertyEmbed.addFields({
        name: '🎉 Collection Complete!',
        value:
          `**${property.title}** unlocked!\n` +
          `💰 Set Bonus: **${property.setBonus.toLocaleString()} BB**`,
        inline: false,
      });
    }

    propertyEmbed
      .setFooter({
        text: `New balance: ${player.balance.toLocaleString()} BB`,
      })
      .setTimestamp();

    await interaction.channel.send({
      content: `<@${member.id}>`,
      embeds: [propertyEmbed],
      allowedMentions: {
        users: [member.id],
      },
    });

    let confirmation =
      `✅ Awarded **${property.name}** to ${member}.\n` +
      `💰 Property reward: **${property.reward.toLocaleString()} BB**`;

    if (awardedBonus) {
      confirmation +=
        `\n🎉 Completed **${property.setName}** and earned ` +
        `**${property.setBonus.toLocaleString()} BB**.\n` +
        `👑 Title unlocked: **${property.title}**`;
    }

    confirmation += `\n💵 New balance: **${player.balance.toLocaleString()} BB**`;

    return interaction.editReply({
      content: confirmation,
    });
  } catch (error) {
    console.error(
      'Error awarding property:',
      error
    );

    return interaction.editReply({
      content:
        '❌ Something went wrong while awarding that property.',
    });
  }
}

function getRarityDisplay(rarity) {
  const rarityDisplays = {
    Common: {
      emoji: '🟢',
    },
    Uncommon: {
      emoji: '🔵',
    },
    Rare: {
      emoji: '🟣',
    },
    Epic: {
      emoji: '🟠',
    },
    Legendary: {
      emoji: '🟡',
    },
  };

  return (
    rarityDisplays[rarity] || {
      emoji: '⚪',
    }
  );
}

async function handlePropertyRemove(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  try {
    const member = interaction.options.getUser('member');
    const propertyId =
      interaction.options.getString('property');

    const property = getPropertyById(propertyId);

    if (!property) {
      return interaction.editReply({
        content:
          '❌ I could not find that property in the property catalog.',
      });
    }

    const player = await Player.findOne({
      guildId: interaction.guildId,
      userId: member.id,
    });

    if (!player) {
      return interaction.editReply({
        content: `❌ ${member} does not have a player profile yet.`,
      });
    }

    player.properties ??= [];
    player.completedSets ??= [];
    player.earnedSetBonuses ??= [];

    if (!player.properties.includes(property.id)) {
      return interaction.editReply({
        content: `❌ ${member} does not own **${property.name}**.`,
      });
    }

    const previouslyCompletedSet =
      player.completedSets.includes(property.setId);

    player.properties = player.properties.filter(
      (ownedPropertyId) =>
        ownedPropertyId !== property.id
    );

    const setProperties = getPropertiesBySetId(
      property.setId
    );

    const stillOwnsFullSet = setProperties.every(
      (setProperty) =>
        player.properties.includes(setProperty.id)
    );

    let lostCollectionTitle = false;

    if (previouslyCompletedSet && !stillOwnsFullSet) {
      player.completedSets = player.completedSets.filter(
        (completedSetId) =>
          completedSetId !== property.setId
      );

      lostCollectionTitle = true;
    }

    await player.save();

    let confirmation =
      `✅ Removed **${property.name}** from ${member}.\n` +
      `💰 No BB was removed.`;

    if (lostCollectionTitle) {
      confirmation +=
        `\n👑 **${property.title}** is no longer unlocked because ` +
        `the **${property.setName}** collection is incomplete.`;
    }

    return interaction.editReply({
      content: confirmation,
    });
  } catch (error) {
    console.error('Error removing property:', error);

    return interaction.editReply({
      content:
        '❌ Something went wrong while removing that property.',
    });
  }
}