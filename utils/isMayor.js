const OWNER_ID = "995441043505946634";

async function isMayor(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    await interaction.reply({
      content: "Unable to complete this request.",
      ephemeral: true,
    });

    return false;
  }

  return true;
}

module.exports = { isMayor };