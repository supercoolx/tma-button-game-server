const History = require('../models/History');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const getAllTodos = async (req, res) => {
    const todos = await User.find({}).sort({ score: -1 });
    res.status(StatusCodes.OK).json(todos);
};

const getProbability = (p) => {
  console.log("probability=", p);
  return Math.random() < p;
}

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
  var isJackpot = 0;
  if(history.heart > 0) {
    isJackpot = getProbability(0.5) ? 1 : 0;
    console.log("jackpot=", isJackpot);
  }
  history.heart = isJackpot > 0 ? 0 : (getProbability(0.5) ? 1 : 0);

  await history.save();
  res.status(StatusCodes.CREATED).json({
    _id: isReset ? "" : history._id,
    score: history.score,
    max_score: user.score > history.score ? user.score : history.score,
    jackpot: isJackpot,
    heart : history.heart,
  });
};

module.exports = {
    getAllTodos,
    createTodo,
};
