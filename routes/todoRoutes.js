const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createTodo,
  getAllTodos,
  resetLeaderBoard,
} = require('../controllers/todoController');

router
  .route('/')
  // .post([authenticateUser], createTodo)
  .post(createTodo)
  .get(getAllTodos);

// router.route('/reset').post(authenticateUser, resetLeaderBoard);
router.route('/reset').post(resetLeaderBoard);

module.exports = router;
