require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

const {
  REST,
  Routes,
} = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

function loadCommandFiles(directory) {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      loadCommandFiles(entryPath);
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

    commands.push(command.data.toJSON());
  }
}

loadCommandFiles(commandsPath);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
  try {
    console.log(`🔄 Registering ${commands.length} guild command(s)...`);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
    process.exitCode = 1;
  }
}

deployCommands();