const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    task: String,
    completed: Boolean,
});
module.exports = mongoose.model('Todo', TodoSchema);