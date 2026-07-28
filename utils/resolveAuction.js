const {
    EmbedBuilder,
} = require("discord.js");

const Auction = require("../models/Auction");
const Player = require("../models/Player");
const PROPERTY_DEED_CHANNEL_ID = "1499925370378653696";

const {
    getPropertyById,
    getPropertySetById,
    getPropertiesBySetId,
} = require("../data/properties");

const {
    buildAuctionEmbed,
    disableAuctionButtons,
    getAuctionMessage,
} = require("./auctionDisplay");

async function awardCompletedSet(player, property) {

    const propertySet =
        getPropertySetById(property.setId);

    if (!propertySet) {
        return null;
    }

    const setProperties =
        getPropertiesBySetId(property.setId);

    const ownsEntireSet =
        setProperties.every(setProperty =>
            player.properties.includes(setProperty.id)
        );

    if (!ownsEntireSet) {
        return null;
    }

    if (
        player.completedSets.includes(property.setId)
    ) {
        return null;
    }

    player.completedSets.push(
        property.setId
    );

    if (
        !player.earnedSetBonuses.includes(
            property.setId
        )
    ) {

        player.earnedSetBonuses.push(
            property.setId
        );

        player.balance +=
            propertySet.setBonus;

    }

    return propertySet;

}

module.exports = async function resolveAuction(
    client,
    auction
) {

    /*
    |--------------------------------------------------------------------------
    | Lock the auction
    |--------------------------------------------------------------------------
    |
    | Only ONE resolver may process an auction.
    |
    */

    const lockedAuction =
        await Auction.findOneAndUpdate(
            {
                _id: auction._id,
                status: "active",
            },
            {
                $set: {
                    status: "processing",
                },
            },
            {
                new: true,
            }
        );

    if (!lockedAuction) {

        return {
            status: "already_processed",
        };

    }

    const property =
        getPropertyById(
            lockedAuction.propertyId
        );

    const message =
        await getAuctionMessage(
            client,
            lockedAuction
        );

            /*
    |--------------------------------------------------------------------------
    | No bids
    |--------------------------------------------------------------------------
    */

    if (
        !lockedAuction.highestBidderId
    ) {

        await Auction.updateOne(
            {
                _id: lockedAuction._id,
            },
            {
                $set: {
                    status: "expired",
                    completedAt: new Date(),
                },
            }
        );

        if (message) {

            const embed =
                new EmbedBuilder()

                    .setColor(0x777777)

                    .setTitle(
                        "🏛️ PROPERTY AUCTION CLOSED"
                    )

                    .setDescription(
                        `${property?.setEmoji ?? "🏡"} **${property?.name ?? "Unknown Property"}** received no bids.\n\nThe property has been returned to the Bank of Bookopoly.`
                    )

                    .setTimestamp();

            await message.edit({

                embeds: [embed],

                components:
                    disableAuctionButtons(
                        message
                    ),

            });

        }

        return {
            status: "no_bids",
        };

    }

        /*
    |--------------------------------------------------------------------------
    | Process Winner
    |--------------------------------------------------------------------------
    */

    const winner =
        await Player.findOne({
            guildId: lockedAuction.guildId,
            userId: lockedAuction.highestBidderId,
        });

    if (!winner) {

        await Auction.updateOne(
            {
                _id: lockedAuction._id,
            },
            {
                $set: {
                    status: "cancelled",
                    completedAt: new Date(),
                },
            }
        );

        return {
            status: "winner_missing",
        };

    }

    winner.balance -= lockedAuction.highestBid;
    winner.balance += property.reward;

    if (
        !winner.properties.includes(
            lockedAuction.propertyId
        )
    ) {

        winner.properties.push(
            lockedAuction.propertyId
        );

    }

    const completedSet =
        await awardCompletedSet(
            winner,
            property
        );

    await winner.save();

        /*
    |--------------------------------------------------------------------------
    | Finish Auction Record
    |--------------------------------------------------------------------------
    */

    lockedAuction.status = "completed";

    lockedAuction.completedAt =
        new Date();

    lockedAuction.winnerId =
        winner.userId;

    lockedAuction.winnerUsername =
        winner.username;

    lockedAuction.winningBid =
        lockedAuction.highestBid;

    await lockedAuction.save();

        /*
    |--------------------------------------------------------------------------
    | Update Auction Message
    |--------------------------------------------------------------------------
    */

    if (message) {

        const updatedAuction = {
            ...lockedAuction.toObject(),
            status: "completed",
        };

        const embed =
            buildAuctionEmbed(
                updatedAuction
            );

        if (completedSet) {

            embed.addFields({

                name: "🎉 Set Completed!",

                value:
                    `**${winner.username}** completed the **${completedSet.name}** set and earned **${completedSet.setBonus.toLocaleString()} BB!**`,

            });

        }

        embed.setFooter({
            text: `Auction Complete • Winner: ${winner.username}`,
        });

        await message.edit({

            embeds: [embed],

            components:
                disableAuctionButtons(
                    message
                ),

        });

        await message.channel.send({

    content:
        `**Auction Complete!** Congratulations <@${winner.userId}>!\n\n` +
        `You won **${property.name}** for **${lockedAuction.highestBid.toLocaleString()} BB!** 🏛️`,

});

        const deedChannel =
            client.channels.cache.get(
                PROPERTY_DEED_CHANNEL_ID
            );

        if (deedChannel) {

            const rarityDisplay = {
                Common: { emoji: "🟢" },
                Uncommon: { emoji: "🔵" },
                Rare: { emoji: "🟣" },
                Epic: { emoji: "🟠" },
                Legendary: { emoji: "🟡" },
            };

            const setProperties =
                getPropertiesBySetId(
                    property.setId
                );

            const ownedInSet =
                setProperties.filter(
                    (setProperty) =>
                        winner.properties.includes(
                            setProperty.id
                        )
                ).length;

            const propertyEmbed =
                new EmbedBuilder()
                    .setColor(property.setColor)
                    .setTitle("🏡 Property Deed Issued")
                    .setDescription(
                        `<@${winner.userId}> has obtained **${property.name}**!`
                    )
                    .addFields(
                        {
                            name: "Collection",
                            value: `${property.setEmoji} ${property.setName}`,
                            inline: true,
                        },
                        {
                            name: "Rarity",
                            value: `${rarityDisplay[property.rarity]?.emoji ?? "⚪"} ${property.rarity}`,
                            inline: true,
                        },
                        {
                            name: "Property Reward",
                            value: `💰 ${property.reward.toLocaleString()} BB`,
                            inline: true,
                        },
                        {
                            name: "Acquisition",
                            value: "🏛 Won through the Property Auction",
                            inline: false,
                        },
                        {
                            name: "Collection Progress",
                            value: `${ownedInSet}/${setProperties.length} properties collected`,
                            inline: false,
                        }
                    );

            if (completedSet) {

                propertyEmbed.addFields({

                    name: "🎉 Collection Complete!",

                    value:
                        `**${property.title}** unlocked!\n` +
                        `💰 Set Bonus: **${property.setBonus.toLocaleString()} BB**`,

                    inline: false,

                });

            }

            propertyEmbed
                .setFooter({
                    text: `New balance: ${winner.balance.toLocaleString()} BB`,
                })
                .setTimestamp();

            await deedChannel.send({

                content: `<@${winner.userId}>`,

                embeds: [propertyEmbed],

                allowedMentions: {
                    users: [winner.userId],
                },

            });

        }

    }

        /*
    |--------------------------------------------------------------------------
    | Return Result
    |--------------------------------------------------------------------------
    */

    return {

        status: "completed",

        winner,

        property,

        completedSet,

        winningBid:
            lockedAuction.highestBid,

        auction: lockedAuction,

    };

};

