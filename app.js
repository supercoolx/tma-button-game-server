require('dotenv').config();
require('express-async-errors');
// express

const path = require('path');
const express = require('express');
const app = express();
// rest of the packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const { logger } = require('./helper/logger');

// database
const connectDB = require('./db/connect');

//  routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const todoRouter = require('./routes/todoRoutes');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    max: 600000,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./dist'));
app.use(fileUpload());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/todos', todoRouter);

app.get('*', function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, 'dist')});
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      logger.info(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    logger.info(error);
  }
};

start();

const cron = require("node-cron");
const { sendMessageToAdmins } = require('./helper/botHelper');

const User = require('./models/User');
const { LEADERBOARD_PRIZE } = require('./helper/constants');

// Function to reset scores and record the history
const resetJackPotWeeklyScores = async () => {
  logger.info('JackPot Cron job started.');
  try {
    //send jackpot user list
    const jackUsers = await User.find({ jackpot: { $gt: 0 } }).lean();
    
    const userInfoList = jackUsers.map(user => `@${user.tgId} (${user.jackpot})`);

    const jMsg = 'JackPot Users: \n\r' + userInfoList.join(', \n\r');
    logger.info(jMsg);
    await sendMessageToAdmins(jMsg);

    // Reset jackpot for all users
    await User.updateMany({}, {
      $set: { jackpot: 0 }
    });
    logger.info('jackpot have been reset.');
  } catch (err) {
    console.error('Error during weekly reset:', err);
  }
};
const resetLeaderBoardWeeklyScores = async () => {
  logger.info('Leaderboard Cron job started.');
  try {
    //send leaderboard user list
    const allUsers = await User.find({ score: { $gt: 0 } })
        .sort({ score: -1 })
        .lean();
    let rankedUsers = [];
    let currentRank = 1;

    allUsers.forEach((user, index) => {
        if (index > 0 && allUsers[index].score === allUsers[index - 1].score) {
            rankedUsers.push({ ...user, rank: currentRank });
        } else {
            currentRank = index + 1;
            rankedUsers.push({ ...user, rank: currentRank });
        }
    });

    const rankThreshold = 10;
    var rankScoreThreshold = rankedUsers.find(user => user.rank === rankThreshold)?.score;
    if(!rankScoreThreshold) {
      rankScoreThreshold = 0;
    }

    const topRankUsers = rankedUsers.filter(user => user.rank <= rankThreshold && user.score >= rankScoreThreshold);
    const rankCounts = topRankUsers.reduce((acc, user) => {
      acc[user.rank] = {
        count: (acc[user.rank]?.count || 0) + 1,
        score: user.score
      }
      return acc;
    }, {});
    const getPrizePerUser = (rank, count) => {
      var prizeAmount = 0;
      const until = (rank + count) > 10 ? (10 + 1) : (rank + count);
      for(var i=rank; i<until; i++) {
        prizeAmount += LEADERBOARD_PRIZE[i - 1];
      }
      prizeAmount /= count;
      return prizeAmount;
    }
    Object.keys(rankCounts).forEach(key => {
      const prize = getPrizePerUser(parseInt(key), parseInt(rankCounts[key].count));
      rankCounts[key].prize = prize.toFixed(2);
    });
    const leaderBoardList = topRankUsers.map(user => {
      return `@${user.tgId} rank: ${user.rank} prize: ${rankCounts[user.rank].prize}`
    });
    
    const lMsg = 'LeaderBoard Users: \n\r' + leaderBoardList.join(', \n\r');
    logger.info(lMsg);
    await sendMessageToAdmins(lMsg);

    // Reset scores for all users
    await User.updateMany({}, {
      $set: { score: 0 }
    });
    logger.info('Leaderboard scores have been reset.');
  } catch (err) {
    console.error('Error during weekly reset:', err);
  }
};

// Schedule the task to run every Saturday at midnight
cron.schedule('0 0 * * 6', resetJackPotWeeklyScores);

// Schedule the task to run every Wednesday at midnight
cron.schedule('0 0 * * 3', resetLeaderBoardWeeklyScores);

// resetJackPotWeeklyScores();
// resetLeaderBoardWeeklyScores();