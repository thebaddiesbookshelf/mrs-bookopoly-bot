const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');

const Player = require('../../models/Player'); // Adjust this path if needed
const BookReward = require('../../models/BookReward');
const { isMayor } = require('../../utils/isMayor');

const RESET_DATA = {
  balance: 0,

  booksLogged: 0,

  properties: [],
  completedSets: [],
  earnedSetBonuses: [],

  getOutOfJailCards: 0,

  cardsDrawn: 0,
  lastCardDraw: null,

  jailVisits: 0,
  isInJail: false,
  jailReason: null,
  jailBookedAt: null,
  lastPassGo: null,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset Bookopoly player data.')

    .addSubcommand((subcommand) =>
      subcommand
        .setName('player')
        .setDescription('Reset one member’s Bookopoly data.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('The member whose Bookopoly data will be reset.')
            .setRequired(true)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('all')
        .setDescription('Reset all Bookopoly players in this server.')
    ),

  async execute(interaction) {
     if (!(await isMayor(interaction))) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'player') {
      return handlePlayerReset(interaction);
    }

    if (subcommand === 'all') {
      return handleAllReset(interaction);
    }
  },
};

async function handlePlayerReset(interaction) {
  const member = interaction.options.getUser('member', true);

  const player = await Player.findOne({
    guildId: interaction.guildId,
    userId: member.id,
  });

  if (!player) {
    return interaction.reply({
      content: `❌ ${member} does not have a Bookopoly player profile to reset.`,
      ephemeral: true,
    });
  }

  const confirmId = `reset-player-confirm-${interaction.id}`;
  const cancelId = `reset-player-cancel-${interaction.id}`;

  const confirmationEmbed = new EmbedBuilder()
    .setColor('#F4B942')
    .setTitle('⚠️ Confirm Player Reset')
    .setDescription(
      `Are you sure you want to reset all Bookopoly data for ${member}?\n\n` +
        `This will reset their:\n` +
        `• Baddie Buck balance\n` +
        `• Properties\n` +
        `• Completed collections\n` +
        `• Earned collection bonuses\n` +
        `• Card history\n` +
        `• Jail cards and jail history`
    )
    .setFooter({
      text: 'This action cannot be undone.',
    });

  const buttons = createConfirmationButtons(confirmId, cancelId);

  await interaction.reply({
    embeds: [confirmationEmbed],
    components: [buttons],
    ephemeral: true,
  });

  const response = await interaction.fetchReply();

  try {
    const buttonInteraction = await response.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 30_000,
      filter: (button) => button.user.id === interaction.user.id,
    });

    if (buttonInteraction.customId === cancelId) {
      await buttonInteraction.update({
        content: '❌ Player reset cancelled.',
        embeds: [],
        components: [],
      });

      return;
    }

    await buttonInteraction.deferUpdate();

const result = await Player.updateMany(
  {
    guildId: interaction.guildId,
  },
  {
    $set: RESET_DATA,
  }
);

// Clear all processed book rewards for a fresh Bookopoly run.
await BookReward.deleteMany({
  guildId: interaction.guildId,
});

    if (!result) {
      await interaction.editReply({
        content: `❌ I could not find ${member}'s Bookopoly profile.`,
        embeds: [],
        components: [],
      });

      return;
    }

    const successEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Player Reset Complete')
      .setDescription(
        `${member}'s Bookopoly data has been completely reset.\n\n` +
          `• Balance reset to **0 BB**\n` +
          `• Properties removed\n` +
          `• Collection progress reset\n` +
          `• Card history cleared\n` +
          `• Jail history cleared`
      )
      .setFooter({
        text: 'Their Discord identity and player profile were not deleted.',
      });

    await interaction.editReply({
      content: null,
      embeds: [successEmbed],
      components: [],
    });
  } catch (error) {
    if (error.code === 'InteractionCollectorError') {
      await interaction.editReply({
        content: '⌛ Confirmation timed out. No player data was reset.',
        embeds: [],
        components: [],
      });

      return;
    }

    console.error('Error resetting Bookopoly player:', error);

    await interaction.editReply({
      content: '❌ Something went wrong while resetting that player.',
      embeds: [],
      components: [],
    });
  }
}

async function handleAllReset(interaction) {
  const playerCount = await Player.countDocuments({
    guildId: interaction.guildId,
  });

  if (playerCount === 0) {
    return interaction.reply({
      content: '❌ There are no Bookopoly player profiles to reset in this server.',
      ephemeral: true,
    });
  }

  const confirmId = `reset-all-confirm-${interaction.id}`;
  const cancelId = `reset-all-cancel-${interaction.id}`;

  const confirmationEmbed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle('🚨 Confirm Full Bookopoly Reset')
    .setDescription(
      `This will reset **all ${playerCount} Bookopoly player profiles** in this server.\n\n` +
        `Every player will lose their current:\n` +
        `• Baddie Buck balance\n` +
        `• Properties\n` +
        `• Completed collections\n` +
        `• Earned collection bonuses\n` +
        `• Card history\n` +
        `• Jail cards and jail history\n\n` +
        `**This action cannot be undone.**`
    )
    .setFooter({
      text: 'Player profiles will remain in the database.',
    });

  const buttons = createConfirmationButtons(confirmId, cancelId);

  await interaction.reply({
    embeds: [confirmationEmbed],
    components: [buttons],
    ephemeral: true,
  });

  const response = await interaction.fetchReply();

  try {
    const buttonInteraction = await response.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 30_000,
      filter: (button) => button.user.id === interaction.user.id,
    });

    if (buttonInteraction.customId === cancelId) {
      await buttonInteraction.update({
        content: '❌ Full Bookopoly reset cancelled.',
        embeds: [],
        components: [],
      });

      return;
    }

    await buttonInteraction.deferUpdate();

    const result = await Player.updateMany(
      {
        guildId: interaction.guildId,
      },
      {
        $set: RESET_DATA,
      }
    );

    const successEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Bookopoly Reset Complete')
      .setDescription(
        `All Bookopoly gameplay data has been reset for **${result.matchedCount} players**.\n\n` +
          `Everyone is now ready for a fresh Bookopoly run.`
      )
      .setFooter({
        text: 'Player profiles and identifying information were preserved.',
      });

    await interaction.editReply({
      content: null,
      embeds: [successEmbed],
      components: [],
    });
  } catch (error) {
    if (error.code === 'InteractionCollectorError') {
      await interaction.editReply({
        content: '⌛ Confirmation timed out. No player data was reset.',
        embeds: [],
        components: [],
      });

      return;
    }

    console.error('Error resetting all Bookopoly players:', error);

    await interaction.editReply({
      content: '❌ Something went wrong while resetting Bookopoly data.',
      embeds: [],
      components: [],
    });
  }
}

function createConfirmationButtons(confirmId, cancelId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(confirmId)
      .setLabel('Confirm Reset')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(cancelId)
      .setLabel('Cancel')
      .setEmoji('✖️')
      .setStyle(ButtonStyle.Secondary)
  );
}