const JAIL_CHANNEL_ID = "1499925731155644478";

const ALLOWED_ROLE_IDS = [
    "1530989265297866862",
    "1528633013380841572",
    "1529717344799293561",
    "1528701892614422660",
    "1437278266061885541",
];

async function handleJailMessage(message) {
    if (!message.guild) return;
    if (message.channelId !== JAIL_CHANNEL_ID) return;

    const member = message.member;

    if (!member) return;

    const hasAllowedRole = ALLOWED_ROLE_IDS.some((roleId) =>
        member.roles.cache.has(roleId)
    );

    if (hasAllowedRole) return;

    try {
        await message.delete();
    } catch (error) {
        console.error(
            "Failed to delete unauthorized jail message:",
            error
        );
    }
}

module.exports = handleJailMessage;