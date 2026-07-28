const Auction = require("../models/Auction");
const resolveAuction = require("../utils/resolveAuction");

module.exports = function startAuctionResolver(client) {

    console.log(
        "Auction resolver started."
    );

    setInterval(async () => {

        try {

            const expiredAuctions =
                await Auction.find({

                    status: "active",

                    endsAt: {
                        $lte: new Date(),
                    },

                });

            for (const auction of expiredAuctions) {

                try {

                    await resolveAuction(
                        client,
                        auction
                    );

                } catch (error) {

                    console.error(
                        `Failed to resolve auction ${auction._id}:`,
                        error
                    );

                }

            }

        } catch (error) {

            console.error(
                "Auction resolver failed:",
                error
            );

        }

    }, 60 * 1000);

};