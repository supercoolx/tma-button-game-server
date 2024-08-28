const mongoose = require('mongoose');

const HistorySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, 'Please provide score'],
    },
    last_score: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, 'Please provide last score'],
    },
    heart: {
      type: Number,
      default: 0,
    },
  },
//   { timestamps: true }
);

module.exports = mongoose.model('History', HistorySchema);

// const mongoose = require('mongoose');

// const HistorySchema = new mongoose.Schema({
//     task: String,
//     completed: Boolean,
// });
// module.exports = mongoose.model('History', HistorySchema);