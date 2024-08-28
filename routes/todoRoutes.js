const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createTodo,
  getAllTodos,
} = require('../controllers/todoController');

router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createTodo)
  .get(getAllTodos);

module.exports = router;
