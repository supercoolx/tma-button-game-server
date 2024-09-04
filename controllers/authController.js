const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
} = require('../utils');
const crypto = require('crypto');

const login = async (req, res) => {
  const { username, fullname, invitor, tgId } = req.body;
  console.log("login=", username, ", ", fullname, ", ", invitor);

  // const { username, name, password } = req.body;
  // const username = "button_dev";
  // const fullname = "Test Name";
  const password = "123qwe!@#";
  // const email = "test@test.com";

  if (!username || !password) {
    throw new CustomError.BadRequestError('Please provide username');
  }

  var user = await User.findOne({ username });
  if (!user) {
    if(invitor != '') {
      var inviteUser = await User.findOne({username: invitor});
      if(inviteUser) {
        console.log("bounus time addes");
        var newBonus = inviteUser.bonus_time;
        let date = new Date();
        if(newBonus < date) {
          newBonus = date;
        }
        const newTimestamp = new Date(newBonus.getTime() + (24 * 60 * 60 * 1000));
        inviteUser.bonus_time = newTimestamp;
        await inviteUser.save();
      }
    }
    // first registered user is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const verificationToken = crypto.randomBytes(40).toString('hex');
    
    user = await User.create({
      name: fullname,
      tgId,
      username,
      password,
      role,
      verificationToken,
    });
  }

  const tokenUser = createTokenUser(user);
  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = {
  login,
  logout,
};
