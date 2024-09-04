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
  joinTelegram,
  checkTgJoined,
  followX,
  getBoostTime,
  getJackPotBoard,
  getLeaderBoard,
} = require('../controllers/todoController');

router
  .route('/')
  // .post([authenticateUser], createTodo)
  .post(createTodo)
  .get(getAllTodos);

router.route('/reset').post(resetLeaderBoard);

router.route('/jointg').post(joinTelegram);
router.route('/checkjointg').get(checkTgJoined);
router.route('/followx').post(followX);
router.route('/getboost').post(getBoostTime);
router.route('/getjackboard').post(getJackPotBoard);
router.route('/getleaderboard').post(getLeaderBoard);

module.exports = router;
