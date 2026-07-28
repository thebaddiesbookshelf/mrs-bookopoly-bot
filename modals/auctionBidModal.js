const { MessageFlags } = require("discord.js");

const Auction = require("../models/Auction");
const Player = require("../models/Player");

const getAvailableBalance = require("../utils/getAvailableBalance");

const {
    buildAuctionEmbed,
    getAuctionMessage,
} = require("../utils/auctionDisplay");

function parseBid(value) {
    const cleaned = value.replace(/,/g, "").trim();

    if (!/^\d+$/.test(cleaned)) return null;

    const amount = Number(cleaned);

    if (!Number.isSafeInteger(amount)) return null;

    if (amount <= 0) return null;

    return amount;
}

module.exports = async function auctionBidModal(interaction) {

    if (!interaction.customId.startsWith("auction_bid_submit:")) return;

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    const auctionId =
        interaction.customId.split(":")[1];

    const bidAmount = parseBid(
        interaction.fields.getTextInputValue("bid_amount")
    );

    if (bidAmount === null) {
        return interaction.editReply({
            content:
                "❌ Enter a valid whole number.",
        });
    }

    const auction = await Auction.findOne({
        _id: auctionId,
        guildId: interaction.guildId,
    });

    if (!auction) {
        return interaction.editReply({
            content:
                "❌ This auction no longer exists.",
        });
    }

    if (auction.status !== "active") {
        return interaction.editReply({
            content:
                "❌ This auction has already ended.",
        });
    }

    if (auction.endsAt <= new Date()) {
        return interaction.editReply({
            content:
                "❌ This auction has already ended.",
        });
    }

    if (auction.highestBidderId === interaction.user.id) {
        return interaction.editReply({
            content:
                "❌ You're already the highest bidder.",
        });
    }

    if (bidAmount <= auction.highestBid) {

    return interaction.editReply({

        content:
            `❌ Your bid must be higher than **${auction.highestBid.toLocaleString()} BB**.`,

    });

}

    const player = await Player.findOne({
        guildId: interaction.guildId,
        userId: interaction.user.id,
    });

    if (!player) {
        return interaction.editReply({
            content:
                "❌ You don't have a Bookopoly profile.",
        });
    }

    if (
        Array.isArray(player.properties) &&
        player.properties.includes(auction.propertyId)
    ) {
        return interaction.editReply({
            content:
                "❌ You already own this property.",
        });
    }

    const wallet =
        await getAvailableBalance(
            interaction.guildId,
            interaction.user.id
        );

    if (bidAmount > wallet.available) {
        return interaction.editReply({
            content:
                `❌ You don't have enough available Baddie Bucks.\n\n` +
                `Balance: **${wallet.balance.toLocaleString()} BB**\n` +
                `Reserved (Trades): **${wallet.reservedTrades.toLocaleString()} BB**\n` +
                `Reserved (Auctions): **${wallet.reservedAuction.toLocaleString()} BB**\n` +
                `Available: **${wallet.available.toLocaleString()} BB**`,
        });
    }

    /*
        Prevent race conditions.

        Only succeeds if someone else
        hasn't already submitted
        a higher bid.
    */

    const updatedAuction =
        await Auction.findOneAndUpdate(
            {
                _id: auction._id,
                guildId: interaction.guildId,
                status: "active",
                highestBid: {
                    $lt: bidAmount,
                },
            },
            {
                $set: {
                    highestBid: bidAmount,
                    highestBidderId:
                        interaction.user.id,
                    highestBidderUsername:
                        interaction.user.username,
                },

                $push: {
                    bids: {
                        userId:
                            interaction.user.id,
                        username:
                            interaction.user.username,
                        amount: bidAmount,
                        placedAt: new Date(),
                    },
                },
            },
            {
                new: true,
            }
        );

    if (!updatedAuction) {

        const latest =
            await Auction.findById(
                auction._id
            );

        if (!latest) {
            return interaction.editReply({
                content:
                    "❌ This auction has ended.",
            });
        }

        return interaction.editReply({
            content:
                `❌ Someone outbid you before your bid could be processed.\n\nCurrent highest bid: **${latest.highestBid.toLocaleString()} BB**`,
        });
    }

    /*
        Update public auction message
    */

    const message =
        await getAuctionMessage(
            interaction.client,
            updatedAuction
        );

    if (message) {
        await message.edit({
            embeds: [
                buildAuctionEmbed(
                    updatedAuction
                ),
            ],
            components:
                message.components,
        });
    }

    await interaction.editReply({
        content:
            `✅ Your bid of **${bidAmount.toLocaleString()} BB** has been placed!\n\nYour Baddie Bucks are now reserved until you are outbid or the auction ends.`,
    });

};