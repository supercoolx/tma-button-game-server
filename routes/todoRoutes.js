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
  invitePeople,
  joinTelegram,
  followX,
  getBoostTime,
} = require('../controllers/todoController');

router
  .route('/')
  // .post([authenticateUser], createTodo)
  .post(createTodo)
  .get(getAllTodos);

// router.route('/reset').post(authenticateUser, resetLeaderBoard);
router.route('/reset').post(resetLeaderBoard);

router.route('/invite').post(invitePeople);
router.route('/jointg').post(joinTelegram);
router.route('/followx').post(followX);
router.route('/getboost').post(getBoostTime);

module.exports = router;
