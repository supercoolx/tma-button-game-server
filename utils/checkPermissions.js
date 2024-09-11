const CustomError = require('../errors');
const { logger } = require('../helper/logger');

const chechPermissions = (requestUser, resourceUserId) => {
  // logger.info(requestUser);
  // logger.info(resourceUserId);
  // logger.info(typeof resourceUserId);
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    'Not authorized to access this route'
  );
};

module.exports = chechPermissions;
