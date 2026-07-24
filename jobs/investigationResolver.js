const Investigation = require('../models/Investigation');
const resolveInvestigation = require('../utils/resolveInvestigation');

module.exports = function startInvestigationResolver(client) {
  // Check every minute for investigations that expired
  setInterval(async () => {
    try {
      const now = new Date();

      const investigations = await Investigation.find({
        status: 'open',
        defenseSubmitted: false,
        expiresAt: { $lte: now },
      });

      for (const investigation of investigations) {
        await resolveInvestigation(client, investigation);
      }
    } catch (error) {
      console.error(
        'Error running investigation resolver:',
        error
      );
    }
  }, 60 * 1000);
};