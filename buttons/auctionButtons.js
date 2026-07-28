const {
    ActionRowBuilder,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

const Auction = require("../models/Auction");
const Player = require("../models/Player");

module.exports = async function auctionButtons(interaction) {
    const [action, auctionId] = interaction.customId.split(":");

    if (action !== "auction_bid") return;

    const auction = await Auction.findOne({
        _id: auctionId,
        guildId: interaction.guildId,
    });

    if (!auction) {
        return interaction.reply({
            content: "❌ This auction no longer exists.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (auction.status !== "active") {
        return interaction.reply({
            content: "❌ This auction has already ended.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (auction.endsAt <= new Date()) {
        return interaction.reply({
            content: "❌ This auction has already ended.",
            flags: MessageFlags.Ephemeral,
        });
    }

    const player = await Player.findOne({
        guildId: interaction.guildId,
        userId: interaction.user.id,
    });

    if (!player) {
        return interaction.reply({
            content: "❌ You don't have a Bookopoly profile yet.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (
        Array.isArray(player.properties) &&
        player.properties.includes(auction.propertyId)
    ) {
        return interaction.reply({
            content:
                "❌ You already own this property and cannot bid on it.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (auction.highestBidderId === interaction.user.id) {
        return interaction.reply({
            content:
                "❌ You're already the highest bidder.",
            flags: MessageFlags.Ephemeral,
        });
    }

    const bidInput = new TextInputBuilder()
        .setCustomId("bid_amount")
        .setLabel("Enter your bid")
        .setPlaceholder(
            auction.highestBid > 0
                ? `Must be more than ${auction.highestBid.toLocaleString()} BB`
                : "Example: 2500"
        )
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(12);

    const row = new ActionRowBuilder().addComponents(
        bidInput
    );

    const modal = new ModalBuilder()
        .setCustomId(`auction_bid_submit:${auction._id}`)
        .setTitle("Place Your Bid")
        .addComponents(row);

    await interaction.showModal(modal);
};