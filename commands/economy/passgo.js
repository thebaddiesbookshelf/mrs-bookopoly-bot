const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

const Player = require('../../models/Player'); // Adjust path if needed

const PASS_GO_REWARD = 250;
const PASS_GO_COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('passgo')
    .setDescription('Pass GO and collect your Baddie Bucks!'),

  async execute(interaction) {
    try {
      const now = new Date();

      let player = await Player.findOne({
        guildId: interaction.guildId,
        userId: interaction.user.id,
      });

      if (!player) {
        player = await Player.create({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          username: interaction.user.username,
        });
      }

      // Keep their stored username current
      if (player.username !== interaction.user.username) {
        player.username = interaction.user.username;
      }

      if (player.lastPassGo) {
        const lastClaim = new Date(player.lastPassGo).getTime();
        const nextClaim = lastClaim + PASS_GO_COOLDOWN;
        const timeRemaining = nextClaim - now.getTime();

        if (timeRemaining > 0) {
          const nextClaimTimestamp = Math.floor(nextClaim / 1000);

          const cooldownEmbed = new EmbedBuilder()
            .setColor('#F4B942')
            .setTitle('⏳ You Haven’t Reached GO Yet!')
            .setDescription(
              `You already collected your GO reward this lap.\n\n` +
                `You can pass GO again <t:${nextClaimTimestamp}:R>.`
            )
            .addFields({
              name: 'Next GO',
              value: `<t:${nextClaimTimestamp}:F>`,
            });

          return interaction.reply({
            embeds: [cooldownEmbed],
            ephemeral: true,
          });
        }
      }

      player.balance += PASS_GO_REWARD;
      player.lastPassGo = now;

      await player.save();

      const nextClaim = now.getTime() + PASS_GO_COOLDOWN;
      const nextClaimTimestamp = Math.floor(nextClaim / 1000);

      const PASS_GO_MESSAGES = [
  {
    title: '🏦 You Passed GO!',
    description:
      'The Bookopoly Bank has deposited your reward. Spend those Baddie Bucks wisely!',
  },
  {
    title: '💵 Payday!',
    description:
      'Another lap around the board means another payday. The bank has added your reward!',
  },
  {
    title: '🏦 Bank Deposit Complete!',
    description:
      'The cashier smiles and slides your Baddie Bucks across the counter.',
  },
  {
    title: '🚗 Another Lap Complete!',
    description:
      'You made it all the way around Bookopoly! Collect your reward before continuing.',
  },
  {
    title: '📍 Welcome Back to GO!',
    description:
      'Back where every great Bookopoly journey begins. Your reward is waiting!',
  },
  {
    title: '🎉 You Made It Around!',
    description:
      'Another trip around the board is officially complete. Time to collect!',
  },
  {
    title: '📚 Reading Pays!',
    description:
      'Every chapter leads somewhere new—and this one led straight back to GO.',
  },
  {
    title: '📖 Bookshelf and Bankroll!',
    description:
      'Your bookshelf keeps growing, and so does your Baddie Buck balance!',
  },
  {
    title: '✨ GO Bonus Collected!',
    description:
      'Even the busiest readers deserve a payday. Enjoy your reward!',
  },
  {
    title: '💅 Money Moves!',
    description:
      'The Baddies always make their money moves. Your reward has been deposited!',
  },
  {
    title: '👑 Rich Baddie Behavior!',
    description:
      'Another fabulous lap deserves another fabulous reward.',
  },
  {
    title: '🌸 Reading Richer!',
    description:
      'Looking rich and reading richer. Your Bookopoly funds just received a boost!',
  },
  {
    title: '🏃 Safe From Jail!',
    description:
      'You somehow made it around the board without getting stuck in Jail. Impressive.',
  },
  {
    title: '💸 Back Again?',
    description:
      'The bank is starting to question how often you show up—but your reward is ready.',
  },
  {
    title: '📦 Just Vibes and Bucks!',
    description:
      'No taxes. No fees. Just vibes and another GO reward.',
  },
  {
    title: '🏦 The Vault Opens!',
    description:
      'The banker sighs, opens the vault, and hands over another stack of Baddie Bucks.',
  },
  {
    title: '🎲 What Comes Next?',
    description:
      'Maybe your next stop is Chance. Maybe it is Jail. Enjoy your reward while you can!',
  },
  {
    title: '🏠 Time to Invest!',
    description:
      'Those properties are not going to collect themselves. Put those fresh funds to work!',
  },
  {
    title: '🤝 Ready to Trade?',
    description:
      'A fresh GO reward could be exactly what you need to make your next deal.',
  },
  {
    title: '💰 Fresh Funds!',
    description:
      'The Bookopoly Bank welcomes you back to the start of the board.',
  },
];

      const randomMessage =
  PASS_GO_MESSAGES[
    Math.floor(Math.random() * PASS_GO_MESSAGES.length)
  ];

      const successEmbed = new EmbedBuilder()
          .setColor('#F45AA5')
         .setTitle(randomMessage.title)
         .setDescription(
    `${randomMessage.description}\n\n` +
      `💵 **+${PASS_GO_REWARD.toLocaleString()} Baddie Bucks**`
  )
        .addFields(
          {
            name: 'Current Balance',
            value: `**${player.balance.toLocaleString()} BB**`,
            inline: true,
          },
          {
            name: 'Next GO',
            value: `<t:${nextClaimTimestamp}:R>`,
            inline: true,
          }
        )
        .setFooter({
          text: 'Come back every 4 hours to pass GO again!',
        });

      return interaction.reply({
        embeds: [successEmbed],
      });
    } catch (error) {
      console.error('Error running /passgo:', error);

      if (interaction.replied || interaction.deferred) {
        return interaction.followUp({
          content: '❌ Something went wrong while passing GO.',
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: '❌ Something went wrong while passing GO.',
        ephemeral: true,
      });
    }
  },
};