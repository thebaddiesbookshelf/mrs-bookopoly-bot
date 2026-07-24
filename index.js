require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const jailButtons = require('./buttons/jailButtons');
const tradeButtons = require('./buttons/tradeButtons');
const Player = require('./models/Player');
const BookReward = require('./models/BookReward');
const calculateBookReward = require('./utils/bookRewardCalculator');
const startInvestigationResolver = require('./jobs/investigationResolver');

const {
  ActivityType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

function loadCommands(directory) {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      loadCommands(entryPath);
      continue;
    }

    if (!entry.name.endsWith('.js')) {
      continue;
    }

    const command = require(entryPath);

    if (!command.data || !command.execute) {
      console.warn(`⚠️ Skipped ${entryPath}: missing data or execute.`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

loadCommands(path.join(__dirname, 'commands'));

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Logged in as ${readyClient.user.tag}`);
  console.log(`✅ Loaded ${client.commands.size} command(s)`);

  readyClient.user.setActivity('Managing Properties', {
    type: ActivityType.Playing,
  });

  startInvestigationResolver(readyClient);
  console.log('🕵️ Investigation resolver started.');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
  try {
    const customId = interaction.customId;

    if (customId.startsWith('trade_')) {
      await tradeButtons(interaction);
    } else {
      await jailButtons(interaction);
    }
  } catch (error) {
    console.error('Error handling button interaction:', error);

    const errorMessage = {
      content:
        'Mrs. Bookopoly misplaced that page in her ledger. Please try again!',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }

  return;
}

  if (interaction.isAutocomplete()) {
  const command = interaction.client.commands.get(
    interaction.commandName
  );

  if (!command || !command.autocomplete) {
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(
      `Error handling autocomplete for /${interaction.commandName}:`,
      error
    );
  }

  return;
}

if (!interaction.isChatInputCommand()) {
  return;
}

const command = interaction.client.commands.get(
  interaction.commandName
);

if (!command) {
  console.error(`No command found for /${interaction.commandName}`);
  return;
}

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `Error executing /${interaction.commandName}:`,
      error
    );

    const errorMessage = {
      content:
        'Mrs. Bookopoly misplaced that page in her ledger. Please try again!',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

const BOOK_LOG_CHANNEL_ID = '1499925482903306352';

client.on(Events.MessageCreate, async (message) => {
  try {
    // Ignore bots and messages outside servers.
    if (message.author.bot || !message.guild) {
      return;
    }

    // Only track messages sent in the official book-log channel.
    if (message.channelId !== BOOK_LOG_CHANNEL_ID) {
      return;
    }

    const player = await Player.findOneAndUpdate(
      {
        guildId: message.guild.id,
        userId: message.author.id,
      },
      {
        $set: {
          username: message.author.username,
          lastBookLogged: new Date(),
        },
        $inc: {
          booksLogged: 1,
        },
        $setOnInsert: {
          balance: 0,
          properties: [],
          completedSets: [],
          earnedSetBonuses: [],
          getOutOfJailCards: 0,
          cardsDrawn: 0,
          jailVisits: 0,
          isInJail: false,
          jailReason: null,
          jailBookedAt: null,
          lastCardDraw: null,
          lastPassGo: null,
          lastReportAt: null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(
      `📚 Logged book activity for ${message.author.username}. ` +
      `Total books: ${player.booksLogged}`
    );

    const pagesMatch = message.content.match(
  /total pages:\s*(\d+)/i
);

if (!pagesMatch) {
  console.log('❌ Could not find a page count.');
  return;
}

const pages = parseInt(pagesMatch[1], 10);

console.log(`📖 Parsed page count: ${pages}`);

const formatMatch = message.content.match(
  /book format:\s*([^\n\r]+)/i
);

const format = formatMatch
  ? formatMatch[1].trim()
  : '';

console.log(`📚 Parsed book format: ${format || 'Not provided'}`);

// Do not reward the same message more than once.
const existingReward = await BookReward.findOne({
  messageId: message.id,
});

if (existingReward) {
  console.log('⚠️ This book-log message was already rewarded.');
  return;
}

// Calculate the reward based on pages and format.
const reward = calculateBookReward(pages, format);

// Add the reward to the player's wallet.
const rewardedPlayer = await Player.findOneAndUpdate(
  {
    guildId: message.guild.id,
    userId: message.author.id,
  },
  {
    $inc: {
      balance: reward,
    },
  },
  {
    returnDocument: 'after',
  }
);

if (!rewardedPlayer) {
  console.log('❌ Could not find the player to reward.');
  return;
}

// Save the message so it cannot be rewarded again.
await BookReward.create({
  messageId: message.id,
  guildId: message.guild.id,
  userId: message.author.id,
  pages,
  format: format || 'Novel',
  reward,
});

// React to show that the deposit was processed.
await message.react('💰');

// Send a temporary confirmation.
const confirmation = await message.reply({
  content:
    `🏦 **Deposit approved!** You earned **${reward.toLocaleString()} BB**.\n` +
    `Your new balance is **${rewardedPlayer.balance.toLocaleString()} BB**.`,
  allowedMentions: {
    repliedUser: false,
  },
});

// Delete Mrs. Bookopoly's confirmation after 10 seconds.
setTimeout(() => {
  confirmation.delete().catch(() => {});
}, 10_000);

console.log(
  `💰 Awarded ${reward} BB to ${message.author.username}. ` +
  `New balance: ${rewardedPlayer.balance}`
);

  } catch (error) {
    console.error('Error tracking book-log activity:', error);
  }
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', async () => {
  console.log('\nShutting down Mrs. Bookopoly...');

  await mongoose.connection.close();
  client.destroy();

  process.exit(0);
});

async function startBot() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file.');
    }

    if (!process.env.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN is missing from the .env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'MrsBookopoly',
    });

    console.log('✅ Connected to the MrsBookopoly database');

    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ Failed to start Mrs. Bookopoly:', error);
    process.exit(1);
  }
}

startBot();