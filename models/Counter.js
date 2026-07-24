const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  value: {
    type: Number,
    default: 0,
    min: 0,
  },
});

counterSchema.index(
  {
    guildId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Counter', counterSchema);