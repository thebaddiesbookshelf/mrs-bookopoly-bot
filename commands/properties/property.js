const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');

const Player = require('../../models/Player');

const {
  propertySets,
  properties,
  getPropertyById,
  getPropertySetById,
} = require('../../data/properties');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('property')
    .setDescription('Manage player properties.')

    .addSubcommand((subcommand) =>
      subcommand
        .setName('collection')
        .setDescription("View a player's property collection.")
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription(
              'The member whose collection you want to view.'
            )
            .setRequired(false)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View details about a property.')
        .addStringOption((option) =>
          option
            .setName('property')
            .setDescription('The property you want to view.')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('View one or all property collections.')
        .addStringOption((option) =>
          option
            .setName('collection')
            .setDescription(
              'Choose a property collection or select All Collections.'
            )
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction) {
    try {
      const focusedOption = interaction.options.getFocused(true);
      const focusedValue = focusedOption.value.toLowerCase();
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'set') {
        const choices = [];

        const allCollectionChoice = {
          name: '📚 All Property Collections',
          value: 'all',
        };

        if (
          'all'.includes(focusedValue) ||
          'all property collections'.includes(focusedValue) ||
          'property collections'.includes(focusedValue)
        ) {
          choices.push(allCollectionChoice);
        }

        const matchingSets = propertySets
          .filter((set) => {
            return (
              set.name.toLowerCase().includes(focusedValue) ||
              set.displayName.toLowerCase().includes(focusedValue) ||
              set.id.toLowerCase().includes(focusedValue)
            );
          })
          .map((set) => ({
            name: `${set.emoji} ${set.displayName}`,
            value: set.id,
          }));

        choices.push(...matchingSets);

        return interaction.respond(choices.slice(0, 25));
      }

      const matchingProperties = properties
        .filter((property) => {
          return (
            property.name.toLowerCase().includes(focusedValue) ||
            property.setName.toLowerCase().includes(focusedValue) ||
            property.id.toLowerCase().includes(focusedValue)
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
      console.error('Property autocomplete error:', error);

      if (!interaction.responded) {
        await interaction.respond([]);
      }
    }
  },

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'collection':
        return handlePropertyCollection(interaction);

      case 'view':
        return handlePropertyView(interaction);

      case 'set':
        return handlePropertySet(interaction);

      default:
        return;
    }
  },
};

/**
 * View a player's overall property portfolio.
 */
async function handlePropertyCollection(interaction) {
  await interaction.deferReply();

  try {
    const selectedUser =
      interaction.options.getUser('member') || interaction.user;

    const player = await Player.findOne({
      guildId: interaction.guildId,
      userId: selectedUser.id,
    });

    const ownedProperties = player?.properties ?? [];

    const collectionLines = propertySets.map((set) => {
      const ownedCount = set.properties.filter((property) =>
        ownedProperties.includes(property.id)
      ).length;

      const totalCount = set.properties.length;

      let statusEmoji = '⬜';

      if (ownedCount === totalCount) {
        statusEmoji = '✅';
      } else if (ownedCount > 0) {
        statusEmoji = '🟨';
      }

      return (
        `${statusEmoji} ${set.emoji} **${set.name}** — ` +
        `**${ownedCount}/${totalCount}**`
      );
    });

    const totalOwned = ownedProperties.length;
    const totalAvailable = properties.length;

    const portfolioValue = ownedProperties.reduce(
      (total, ownedPropertyId) => {
        const ownedProperty = getPropertyById(ownedPropertyId);

        return total + (ownedProperty?.reward ?? 0);
      },
      0
    );

    const unlockedTitles = propertySets
      .filter((set) =>
        set.properties?.every((setProperty) =>
          ownedProperties.includes(setProperty.id)
        )
      )
      .map((set) => {
        const firstProperty = properties.find(
          (property) =>
            property.id === set.properties?.[0]?.id
        );

        const unlockedTitle =
          firstProperty?.title ??
          set.title ??
          set.name ??
          'Collection Complete';

        return `${set.emoji} ${unlockedTitle}`;
      });

    const collectionEmbed = new EmbedBuilder()
      .setColor(0xf45aa5)
      .setTitle(`🏡 ${selectedUser.username}'s Property Portfolio`)
      .setDescription(collectionLines.join('\n'))
      .addFields(
        {
          name: 'Properties Owned',
          value: `🏡 **${totalOwned}/${totalAvailable}**`,
          inline: true,
        },
        {
          name: 'Titles Unlocked',
          value:
            `👑 **${unlockedTitles.length}/` +
            `${propertySets.length}**`,
          inline: true,
        },
        {
          name: 'Portfolio Value',
          value:
            `💰 **${portfolioValue.toLocaleString()} BB**`,
          inline: true,
        }
      )
      .setThumbnail(selectedUser.displayAvatarURL())
      .setTimestamp();

    if (unlockedTitles.length > 0) {
      collectionEmbed.addFields({
        name: '👑 Collection Titles',
        value: unlockedTitles.join('\n'),
        inline: false,
      });
    }

    if (!player || totalOwned === 0) {
      collectionEmbed.setFooter({
        text:
          'No properties collected yet. ' +
          'The board is waiting!',
      });
    } else {
      collectionEmbed.setFooter({
        text:
          `${totalAvailable - totalOwned} properties remaining`,
      });
    }

    return interaction.editReply({
      embeds: [collectionEmbed],
    });
  } catch (error) {
    console.error(
      'Error viewing property collection:',
      error
    );

    return interaction.editReply({
      content:
        '❌ Something went wrong while opening that ' +
        'property portfolio.',
    });
  }
}

/**
 * View the details of one specific property.
 */
async function handlePropertyView(interaction) {
  await interaction.deferReply();

  try {
    const propertyId =
      interaction.options.getString('property');

    const property = getPropertyById(propertyId);

    if (!property) {
      return interaction.editReply({
        content:
          '❌ I could not find that property in the ' +
          'property catalog.',
      });
    }

    const player = await Player.findOne({
      guildId: interaction.guildId,
      userId: interaction.user.id,
    });

    const ownedProperties = player?.properties ?? [];
    const ownsProperty = ownedProperties.includes(property.id);

    const rarityDisplay = getRarityDisplay(property.rarity);

    const propertyEmbed = new EmbedBuilder()
      .setColor(property.setColor)
      .setTitle(`🏡 ${property.name}`)
      .setDescription(
        ownsProperty
          ? '✅ **You own this property.**'
          : '⬜ **You have not collected this property yet.**'
      )
      .addFields(
        {
          name: 'Collection',
          value:
            `${property.setEmoji} **${property.setName}**`,
          inline: true,
        },
        {
          name: 'Rarity',
          value:
            `${rarityDisplay.emoji} ` +
            `**${rarityDisplay.name}**`,
          inline: true,
        },
        {
          name: 'Reward',
          value:
            `💰 **${property.reward.toLocaleString()} BB**`,
          inline: true,
        },
        {
          name: 'How to Earn',
          value: `📖 ${property.requirement}`,
          inline: false,
        },
        {
          name: 'Collection Title',
          value: `👑 **${property.title}**`,
          inline: true,
        },
        {
          name: 'Full Set Bonus',
          value:
            `🎁 **${property.setBonus.toLocaleString()} BB**`,
          inline: true,
        }
      )
      .setFooter({
        text: `Property ID: ${property.id}`,
      })
      .setTimestamp();

    return interaction.editReply({
      embeds: [propertyEmbed],
    });
  } catch (error) {
    console.error('Error viewing property:', error);

    return interaction.editReply({
      content:
        '❌ Something went wrong while opening that property.',
    });
  }
}

/**
 * View one property set or all property sets.
 */
async function handlePropertySet(interaction) {
  await interaction.deferReply();

  try {
    const setId =
      interaction.options.getString('collection');

    if (setId === 'all') {
      return handleAllPropertySets(interaction);
    }

    const propertySet = getPropertySetById(setId);

    if (!propertySet) {
      return interaction.editReply({
        content:
          '❌ I could not find that collection in the ' +
          'property catalog.',
      });
    }

    const player = await Player.findOne({
      guildId: interaction.guildId,
      userId: interaction.user.id,
    });

    const ownedProperties = player?.properties ?? [];

    const ownedCount = propertySet.properties.filter((property) =>
      ownedProperties.includes(property.id)
    ).length;

    const totalCount = propertySet.properties.length;
    const remainingCount = totalCount - ownedCount;
    const hasCompletedSet = ownedCount === totalCount;

    const propertyLines = propertySet.properties.map((property) => {
      const ownsProperty =
        ownedProperties.includes(property.id);

      const statusEmoji = ownsProperty ? '✅' : '⬜';

      return (
        `${statusEmoji} **${property.name}**\n` +
        `└ ${property.requirement}`
      );
    });

    const setEmbed = new EmbedBuilder()
      .setColor(propertySet.color)
      .setTitle(
        `${propertySet.emoji} ${propertySet.displayName}`
      )
      .setDescription(propertyLines.join('\n\n'))
      .addFields(
        {
          name: 'Collection Progress',
          value:
            `🏡 **${ownedCount}/${totalCount} ` +
            `properties earned**`,
          inline: true,
        },
        {
          name: 'Set Completion Bonus',
          value:
            `💰 **${propertySet.setBonus.toLocaleString()} BB**`,
          inline: true,
        },
        {
          name: 'Collection Title',
          value: `👑 **${propertySet.title}**`,
          inline: true,
        }
      )
      .setTimestamp();

    if (hasCompletedSet) {
      setEmbed.setFooter({
        text:
          `Collection complete — ` +
          `${propertySet.title} unlocked!`,
      });
    } else if (remainingCount === 1) {
      setEmbed.setFooter({
        text:
          '1 property remaining to complete this collection.',
      });
    } else {
      setEmbed.setFooter({
        text:
          `${remainingCount} properties remaining to ` +
          `complete this collection.`,
      });
    }

    return interaction.editReply({
      embeds: [setEmbed],
    });
  } catch (error) {
    console.error('Error viewing property set:', error);

    return interaction.editReply({
      content:
        '❌ Something went wrong while opening that ' +
        'property collection.',
    });
  }
}

/**
 * View every property set, six sets per page.
 */
/**
 * Browse every property set, one detailed set per page.
 */
async function handleAllPropertySets(interaction) {
  try {
    const player = await Player.findOne({
      guildId: interaction.guildId,
      userId: interaction.user.id,
    });

    const ownedProperties = player?.properties ?? [];

    const totalPages = propertySets.length;
    let currentPage = 0;

    const previousButtonId =
      `property_sets_previous_${interaction.id}`;

    const nextButtonId =
      `property_sets_next_${interaction.id}`;

    function createPageEmbed(pageIndex) {
      const propertySet = propertySets[pageIndex];

      const ownedCount = propertySet.properties.filter(
        (property) => ownedProperties.includes(property.id)
      ).length;

      const totalCount = propertySet.properties.length;
      const remainingCount = totalCount - ownedCount;
      const hasCompletedSet = ownedCount === totalCount;

      const propertyLines = propertySet.properties.map(
        (property) => {
          const ownsProperty = ownedProperties.includes(
            property.id
          );

          const statusEmoji = ownsProperty ? '✅' : '⬜';

          return (
            `${statusEmoji} **${property.name}**\n` +
            `└ ${property.requirement}`
          );
        }
      );

      const completedSets = propertySets.filter((set) =>
        set.properties.every((property) =>
          ownedProperties.includes(property.id)
        )
      ).length;

      const setEmbed = new EmbedBuilder()
        .setColor(propertySet.color)
        .setTitle(
          `${propertySet.emoji} ${propertySet.displayName}`
        )
        .setDescription(propertyLines.join('\n\n'))
        .addFields(
          {
            name: 'Collection Progress',
            value:
              `🏡 **${ownedCount}/${totalCount} ` +
              `properties earned**`,
            inline: true,
          },
          {
            name: 'Set Completion Bonus',
            value:
              `💰 **${propertySet.setBonus.toLocaleString()} BB**`,
            inline: true,
          },
          {
            name: 'Collection Title',
            value: `👑 **${propertySet.title}**`,
            inline: true,
          }
        )
        .setTimestamp();

      let progressText;

      if (hasCompletedSet) {
        progressText =
          `Collection complete — ` +
          `${propertySet.title} unlocked!`;
      } else if (remainingCount === 1) {
        progressText =
          '1 property remaining to complete this collection.';
      } else {
        progressText =
          `${remainingCount} properties remaining to ` +
          `complete this collection.`;
      }

      setEmbed.setFooter({
        text:
          `Collection ${pageIndex + 1}/${totalPages} • ` +
          `${completedSets}/${propertySets.length} sets complete • ` +
          progressText,
      });

      return setEmbed;
    }

    function createButtonRow(pageIndex, disabled = false) {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(previousButtonId)
          .setLabel('Previous Set')
          .setEmoji('⬅️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled || pageIndex === 0),

        new ButtonBuilder()
          .setCustomId(nextButtonId)
          .setLabel('Next Set')
          .setEmoji('➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(
            disabled || pageIndex === totalPages - 1
          )
      );
    }

    const responsePayload = {
      embeds: [createPageEmbed(currentPage)],
    };

    if (totalPages > 1) {
      responsePayload.components = [
        createButtonRow(currentPage),
      ];
    }

    const message =
      await interaction.editReply(responsePayload);

    if (totalPages <= 1) {
      return message;
    }

    const collector =
      message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120_000,
      });

    collector.on('collect', async (buttonInteraction) => {
      if (
        buttonInteraction.user.id !== interaction.user.id
      ) {
        return buttonInteraction.reply({
          content:
            '❌ Only the person who opened this catalog can ' +
            'change its page.',
          ephemeral: true,
        });
      }

      if (
        buttonInteraction.customId === previousButtonId &&
        currentPage > 0
      ) {
        currentPage -= 1;
      }

      if (
        buttonInteraction.customId === nextButtonId &&
        currentPage < totalPages - 1
      ) {
        currentPage += 1;
      }

      return buttonInteraction.update({
        embeds: [createPageEmbed(currentPage)],
        components: [createButtonRow(currentPage)],
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({
          components: [
            createButtonRow(currentPage, true),
          ],
        });
      } catch (error) {
        console.error(
          'Error disabling property set buttons:',
          error
        );
      }
    });

    return message;
  } catch (error) {
    console.error(
      'Error viewing all property sets:',
      error
    );

    return interaction.editReply({
      content:
        '❌ Something went wrong while opening all ' +
        'property collections.',
      embeds: [],
      components: [],
    });
  }
}

/**
 * Return the emoji and display name for a rarity.
 */
function getRarityDisplay(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return {
        emoji: '⚪',
        name: 'Common',
      };

    case 'uncommon':
      return {
        emoji: '🟢',
        name: 'Uncommon',
      };

    case 'rare':
      return {
        emoji: '🔵',
        name: 'Rare',
      };

    case 'epic':
      return {
        emoji: '🟣',
        name: 'Epic',
      };

    case 'legendary':
      return {
        emoji: '🟡',
        name: 'Legendary',
      };

    default:
      return {
        emoji: '❓',
        name: 'Unknown',
      };
  }
}