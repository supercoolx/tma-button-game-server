const History = require('../models/History');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { isUserJoined } = require('../helper/botHelper');

const getAllTodos = async (req, res) => {
    const todos = await User.find({}).sort({ score: -1 });
    res.status(StatusCodes.OK).json(todos);
};

const getProbability = (p) => {
  return Math.random() < p;
}

const resetLeaderBoard = async (req, res) => {
  const { username } = req.body;
  var user = await User.findOne({username: username});
  if(user && user.role == 'admin') {
    await History.deleteMany({});
  }

  res.status(StatusCodes.OK).json('success');
};

const invitePeople = async (req, res) => {
  const { newer, invitor } = req.body;

  var newUser = await User.findOne({username: newer});
  if(!newUser) {
  }

  res.status(StatusCodes.OK).json('success');
};

const checkTgJoined = async (req, res) => {
  const { username } = req.query;
  const isJoined = await isUserJoined(Number(username));
  return (isJoined ? 
    res.status(StatusCodes.OK).json({ success: true }) : 
    res.status(StatusCodes.OK).json({
      success: false,
      message: 'You didn\'t join our channel'
    })
  );
}

const joinTelegram = async (req, res) => {
  const { username } = req.body;
  var user = await User.findOne({username});
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({
    success: false,
    message: 'user not found'
  });

  if(user.jointg) {
    return res.status(StatusCodes.OK).json({
      success: false,
      message: 'You\'ve already got bonus.'
    });
  } else  {
    const isJoined = await isUserJoined(username);
    if (!isJoined) return res.status(StatusCodes.OK).json({
      success: false,
      message: 'user didn\'t join our channel'
    });

    var newBonus = user.bonus_time;
    let date = new Date();
    if(newBonus < date) {
      newBonus = date;
    }
    const newTimestamp = new Date(newBonus.getTime() + (24 * 60 * 60 * 1000));
    user.bonus_time = newTimestamp;
    user.jointg = 1;
    await user.save();
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'success'
  });
};
const followX = async (req, res) => {
  const { username } = req.body;
  var user = await User.findOne({username});
  if(user && user.followx != 1) {
    user.followx = 1;
    await user.save();
  }

  res.status(StatusCodes.OK).json('success');
};

const getBoostTime = async (req, res) => {
  const { username } = req.body;
  var user = await User.findOne({username});
  var btime = 0;
  if(user) {
    const bonus_time = user.bonus_time;
    const current = new Date();
    if(bonus_time > current) {
      btime = bonus_time.getTime() - current.getTime();
    }
  }
  res.status(StatusCodes.OK).json({bonus_time: btime});
};

const createTodo = async (req, res) => {
  
  const { userid } = req.body;

  var history = req.body.id == "" ? null : await History.findOne({_id: req.body.id});

  if(!history) {
    history = await new History({
      user: userid, //req.user.userId,
      score: 0,
      last_score: 0,
      heart: 0,
    });
  }
  history.last_score = history.score
  const isReset = getProbability(history.score / 100);
  history.score += 1;

  var user = await User.findOne({_id: history.user});
  if(isReset) {
    history.score = 0;
  }
  
  var nHeartBeatPercent = 0.03, nJackPotPercent = 0.5;
  if(user.bonus_time > new Date()) {
    nHeartBeatPercent *= 2;
  }
  console.log("Percent Heart=", nHeartBeatPercent, ", Jackpot=", nJackPotPercent);
  history.heart = getProbability(nHeartBeatPercent) ? 1 : 0;
  var isJackpot = 0;
  if(history.heart > 0) {
    isJackpot = getProbability(nJackPotPercent) ? 1 : 0;
  }
  if(isJackpot > 0) {
    user.jackpot += 10;
  }
  
  user.score = history.last_score > user.score ? history.last_score : user.score;
  await user.save();
  
  await history.save();

  const objRes = {
    _id: isReset ? "" : history._id,
    score: history.score,
    max_score: user.score > history.score ? user.score : history.score,
    jackpot: isJackpot,
    heart : history.heart,
  }
  res.status(StatusCodes.CREATED).json(objRes);
};

module.exports = {
    getAllTodos,
    createTodo,
    resetLeaderBoard,
    invitePeople,
    joinTelegram,
    checkTgJoined,
    followX,
    getBoostTime,
};
