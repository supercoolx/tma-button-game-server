const History = require('../models/History');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { isUserJoined } = require('../helper/botHelper');
const { LEADERBOARD_PRIZE } = require('../helper/constants');
const logger = require('../helper/logger');

const getProbability = (p) => {
  return Math.random() < p;
}

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
    const newTimestamp = new Date(newBonus.getTime() + (4 * 60 * 60 * 1000));
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
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({
    success: false,
    message: 'user not found'
  });

  if(user.followx) {
    return res.status(StatusCodes.OK).json({
      success: false,
      message: 'You\'ve already got bonus.'
    });
  } else  {
    var newBonus = user.bonus_time;
    let date = new Date();
    if(newBonus < date) {
      newBonus = date;
    }
    const newTimestamp = new Date(newBonus.getTime() + (4 * 60 * 60 * 1000));
    user.bonus_time = newTimestamp;

    user.followx = 1;
    await user.save();
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'success'
  });
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
    user.score = history.last_score > user.score ? history.last_score : user.score;
    await user.save();
  }
  
  var nHeartBeatPercent = 0.01, nJackPotPercent = 0.01;
  if(user.bonus_time > new Date()) {
    nHeartBeatPercent *= 2;
  }
  logger.info(`user=${user.tgId} Percent Heart=${nHeartBeatPercent}, Jackpot=${nJackPotPercent}`);
  history.heart = getProbability(nHeartBeatPercent) ? 1 : 0;
  var isJackpot = 0;
  if(history.heart > 0) {
    isJackpot = getProbability(nJackPotPercent) ? 1 : 0;
  }
  if(isJackpot > 0) {
    user.jackpot += 1;
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
  res.status(StatusCodes.CREATED).json(objRes);
};

const filterUsersByUsername = (usersArray, targetUsername) => {
  return usersArray.filter(user => user.username === targetUsername);
}
const getJackPotBoard = async (req, res) => {
  const { username } = req.params;
  const users = await User.find({ jackpot: { $gt: 0 } });
  const filteredUsers = filterUsersByUsername(users, username);
  const remainTime = getRemainingTimeToResetJackpot();
  
  res.status(StatusCodes.OK).json({
    total: users.length,
    exist: filteredUsers.length,
    remainTime,
  });
};

const getLeaderBoard = async (req, res) => {
  const { username } = req.params;
  try {
    // Find all users sorted by score in descending order
    const allUsers = await User.find({ score: { $gt: 0 } })
        .sort({ score: -1 })
        .lean(); // Use lean() to get plain JavaScript objects
    // Calculate ranks for all users
    let rankedUsers = [];
    let currentRank = 1;

    allUsers.forEach((user, index) => {
        // If not the first user and the current score equals the previous score, keep the same rank
        if (index > 0 && allUsers[index].score === allUsers[index - 1].score) {
            rankedUsers.push({ ...user, rank: currentRank });
        } else {
            // Update rank for the current user
            currentRank = index + 1;
            rankedUsers.push({ ...user, rank: currentRank });
        }
    });

    // Determine the score of the 10th rank
    const rankThreshold = 10;
    var rankScoreThreshold = rankedUsers.find(user => user.rank === rankThreshold)?.score;
    if(!rankScoreThreshold) {
      rankScoreThreshold = 0;
    }

    // Filter users up to the 10th rank and include all with the same score as the 10th rank
    const topRankUsers = rankedUsers.filter(user => user.rank <= rankThreshold && user.score >= rankScoreThreshold);
    
    // Count users per rank within the top ranks
    const rankCounts = topRankUsers.reduce((acc, user) => {
        acc[user.rank] = {
          count: (acc[user.rank]?.count || 0) + 1,
          score: user.score
        }
        return acc;
    }, {});

    Object.keys(rankCounts).forEach(key => {
      const prize = getPrizePerUser(parseInt(key), parseInt(rankCounts[key].count));
      rankCounts[key].prize = prize.toFixed(2);
    });

    // Find your rank and score
    const myUser = rankedUsers.find(user => user.username == username);
    const myRank = myUser ? myUser.rank : null;
    const myScore = myUser ? myUser.score : null;
    const remainTime = getRemainingTimeToResetLeaderboard();

    // Log and return the results
    logger.info(['Top Users Count per Rank:', rankCounts]);
    logger.info(`Your Rank: ${myRank}, Your Score: ${myScore}`);


    return res.status(StatusCodes.OK).json({
      rankCounts,
      myRank,
      myScore,
      remainTime,
    });
  } catch (err) {
      logger.error(['Error fetching users:', err]);
      return res.status(StatusCodes.OK).json('failed');
  }
};

const getPrizePerUser = (rank, count) => {
  var prizeAmount = 0;
  const until = (rank + count) > 10 ? (10 + 1) : (rank + count);
  for(var i=rank; i<until; i++) {
    prizeAmount += LEADERBOARD_PRIZE[i - 1];
  }
  prizeAmount /= count;
  return prizeAmount;
}
const getRemainingTimeToResetLeaderboard = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  var daysUntilMonday = (3 - dayOfWeek + 7) % 7; // Days until next Wednesday
  if(daysUntilMonday == 0) {
    daysUntilMonday += 7;
  }
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // Set time to start of the day
  
  const remainingTime = nextMonday - now; // Time in milliseconds

  logger.info(`Leaderboard time remaining until next reset: ${Math.ceil(remainingTime / 1000 / 60 / 60)} hours`);
  
  return remainingTime;
};


const getRemainingTimeToResetJackpot = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  var daysUntilMonday = (6 - dayOfWeek + 7) % 7; // Days until next Saturday
  if(daysUntilMonday == 0) {
    daysUntilMonday += 7;
  }
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // Set time to start of the day
  
  const remainingTime = nextMonday - now; // Time in milliseconds

  logger.info(`Jackpot time remaining until next reset: ${Math.ceil(remainingTime / 1000 / 60 / 60)} hours`);
  
  return remainingTime;
};

module.exports = {
    createTodo,
    joinTelegram,
    checkTgJoined,
    followX,
    getBoostTime,
    getJackPotBoard,
    getLeaderBoard,
};
