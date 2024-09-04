const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createTodo,
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
  .post(createTodo);

router.route('/jointg').post(joinTelegram);
router.route('/checkjointg').get(checkTgJoined);
router.route('/followx').post(followX);
router.route('/getboost').post(getBoostTime);
router.route('/getjackboard/:username').get(getJackPotBoard);
router.route('/getleaderboard/:username').get(getLeaderBoard);

module.exports = router;
