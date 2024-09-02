const History = require('../models/History');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { isUserJoined } = require('../helper/botHelper');

const getAllTodos = async (req, res) => {
    const todos = await User.find({}).sort({ score: -1 });
    res.status(StatusCodes.OK).json(todos);
};

const getProbability = (p) => {
  console.log("probability=", p);
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
  console.log("join tg=", username);
  var user = await User.findOne({username});
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json('user not found');

  if(user.jointg) return res.status(StatusCodes.OK).json('You\'ve already got bonus.');
  
  else  {
    const isJoined = await isUserJoined(username);
    if (!isJoined) return res.status(StatusCodes.UNAUTHORIZED).json('user didn\'t join our channel');

    console.log("bounus time addes");
    var newBonus = user.bonus_time;
    let date = new Date();
    if(newBonus < date) {
      newBonus = date;
    }
    const newTimestamp = new Date(newBonus.getTime() + (24 * 60 * 60 * 1000));
    console.log("new bonus time=", newTimestamp);
    user.bonus_time = newTimestamp;
    user.jointg = 1;
    await user.save();
  }

  return res.status(StatusCodes.OK).json('success');
};
const followX = async (req, res) => {
  const { username } = req.body;
  console.log("follow x=", username);
  var user = await User.findOne({username});
  if(user && user.followx != 1) {
    user.followx = 1;
    await user.save();
  }

  res.status(StatusCodes.OK).json('success');
};

const getBoostTime = async (req, res) => {
  const { username } = req.body;
  console.log("boost user=", username);
  var user = await User.findOne({username});
  var btime = 0;
  if(user) {
    const bonus_time = user.bonus_time;
    const current = new Date();
    if(bonus_time > current) {
      btime = bonus_time.getTime() - current.getTime();
    }
  }
  console.log("boost time=", btime);
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
    user.score = history.last_score > user.score ? history.last_score : user.score;
    await user.save();
  }
  
  var nProbability = 0.5;
  console.log("bonus time ", user.bonus_time, ", ", new Date());
  if(user.bonus_time > new Date()) {
    nProbability *= 2;
  }
  console.log("probability=", nProbability);
  history.heart = getProbability(nProbability) ? 1 : 0;
  var isJackpot = 0;
  if(history.heart > 0) {
    isJackpot = getProbability(nProbability) ? 1 : 0;
  }
  if(isJackpot > 0) {
    user.jackpot += 10;
    await user.save();
  }

  await history.save();
  const objRes = {
    _id: isReset ? "" : history._id,
    score: history.score,
    max_score: user.score > history.score ? user.score : history.score,
    jackpot: isJackpot,
    heart : history.heart,
  }
  console.log(objRes);
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
