async function addLockupRole(interaction, userId) {
  const roleId = process.env.LITERARY_LOCKUP_ROLE_ID;

  if (!roleId) return;

  try {
    const member = await interaction.guild.members.fetch(userId);

    if (!member) return;

    if (member.roles.cache.has(roleId)) return;

    await member.roles.add(roleId);
  } catch (error) {
    console.error(
      'Failed to add Literary Lockup role:',
      error
    );
  }
}

async function removeLockupRole(interaction, userId) {
  const roleId = process.env.LITERARY_LOCKUP_ROLE_ID;

  if (!roleId) return;

  try {
    const member = await interaction.guild.members.fetch(userId);

    if (!member) return;

    if (!member.roles.cache.has(roleId)) return;

    await member.roles.remove(roleId);
  } catch (error) {
    console.error(
      'Failed to remove Literary Lockup role:',
      error
    );
  }
}

module.exports = {
  addLockupRole,
  removeLockupRole,
};
