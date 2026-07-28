const {
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const Player = require('../../models/Player');
const { getRandomQuote } = require('../../utils/quotes');
const { isMayor } = require('../../utils/isMayor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Manage a player’s Baddie Bucks.')

    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add Baddie Bucks to a player’s wallet.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('The member receiving Baddie Bucks.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The number of Baddie Bucks to add.')
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Why the Baddie Bucks are being added.')
            .setMaxLength(200)
            .setRequired(true)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove Baddie Bucks from a player’s wallet.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('The member losing Baddie Bucks.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The number of Baddie Bucks to remove.')
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Why the Baddie Bucks are being removed.')
            .setMaxLength(200)
            .setRequired(true)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set a player’s wallet to an exact amount.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('The member whose balance is being changed.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The player’s new Baddie Bucks balance.')
            .setMinValue(0)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Why the balance is being changed.')
            .setMaxLength(200)
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!(await isMayor(interaction))) return;
    
    await interaction.deferReply({
      ephemeral: true,
    });

    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getUser('member');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason');

    if (member.bot) {
      await interaction.editReply({
        content: 'Bots cannot have Baddie Bucks accounts.',
      });
      return;
    }

    const player = await Player.findOneAndUpdate(
      {
        guildId: interaction.guildId,
        userId: member.id,
      },
      {
        $set: {
          username: member.username,
        },
        $setOnInsert: {
          balance: 0,
          properties: [],
          completedSets: [],
          getOutOfJailCards: 0,
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

    let embedTitle;
    let embedDescription;
    let updatedPlayer;

    if (subcommand === 'add') {
      updatedPlayer = await Player.findOneAndUpdate(
        {
          guildId: interaction.guildId,
          userId: member.id,
        },
        {
          $inc: {
            balance: amount,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      embedTitle = 'Deposit Approved';
      embedDescription =
        `**${amount.toLocaleString()} Baddie Bucks** were added to ` +
        `**${member.displayName}’s** wallet.`;
    }

    if (subcommand === 'remove') {
      if (player.balance < amount) {
        await interaction.editReply({
          content:
            `That transaction cannot be completed. ` +
            `**${member.displayName}** only has ` +
            `**${player.balance.toLocaleString()} Baddie Bucks**.`,
        });
        return;
      }

      updatedPlayer = await Player.findOneAndUpdate(
        {
          guildId: interaction.guildId,
          userId: member.id,
        },
        {
          $inc: {
            balance: -amount,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      embedTitle = 'Withdrawal Approved';
      embedDescription =
        `**${amount.toLocaleString()} Baddie Bucks** were removed from ` +
        `**${member.displayName}’s** wallet.`;
    }

    if (subcommand === 'set') {
      const previousBalance = player.balance;

      updatedPlayer = await Player.findOneAndUpdate(
        {
          guildId: interaction.guildId,
          userId: member.id,
        },
        {
          $set: {
            balance: amount,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      embedTitle = 'Balance Updated';
      embedDescription =
        `**${member.displayName}’s** wallet was changed from ` +
        `**${previousBalance.toLocaleString()}** to ` +
        `**${amount.toLocaleString()} Baddie Bucks**.`;
    }

    const bankEmbed = new EmbedBuilder()
      .setColor(0xF45AA5)
      .setAuthor({
        name: 'Mrs. Bookopoly updates the books...',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle(embedTitle)
      .setThumbnail(member.displayAvatarURL())
      .setDescription(embedDescription)
      .addFields(
        {
          name: '💵 New Balance',
          value: `${updatedPlayer.balance.toLocaleString()} Baddie Bucks`,
          inline: true,
        },
        {
          name: '📝 Reason',
          value: reason,
          inline: false,
        }
      )
      .setFooter({
        text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [bankEmbed],
    });
  },
};