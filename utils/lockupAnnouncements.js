const { EmbedBuilder } = require('discord.js');
const Player = require('../models/Player');
const { getRandomQuote } = require('./quotes');

async function sendLockupAnnouncement(
    interaction,
    {
        title,
        description,
        color,
        author,
        userId,
    }
) {
    const channel = interaction.client.channels.cache.get(
        process.env.LITERARY_LOCKUP_CHANNEL_ID
    );

    if (!channel) return;

    const inmateCount = await Player.countDocuments({
        guildId: interaction.guildId,
        isInJail: true,
    });

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: author,
            iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTitle(title)
        .setDescription(description)
        .addFields(
            {
                name: '📚 Current Inmates',
                value: `${inmateCount} Reader${inmateCount === 1 ? '' : 's'}`,
                inline: true,
            },
            {
                name: '🕒 Record Updated',
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                inline: true,
            }
        )
        .setFooter({
            text: `“${getRandomQuote()}” — Mrs. Bookopoly`,
        })
        .setTimestamp();

    await channel.send({
    content: `<@${userId}>`,
    embeds: [embed],
});
}

module.exports = {
    sendLockupAnnouncement,
};