require('dotenv').config();

const logger = require('../helper/logger');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN); // tracker bot @button_coin_tracker_bot
// const gameBot = new TelegramBot(process.env.GAMEBOT_TOKEN, { polling: true }); // gamebot @button_coin_bot
// const CHANNEL_ID = '-1002153654987'; //macro
const CHANNEL_ID = '-1002154994416'; //button


module.exports.isUserJoined = (userId, channelId = CHANNEL_ID) => bot.getChatMember(channelId, userId)
    .then((chatMember) => {
        if (chatMember.status === 'member' || chatMember.status === 'creator' || chatMember.status === 'administrator') {
            logger.info(`User#${userId} is a ${chatMember.status} of the channel.`);
            return true;
        } else {
            logger.info(`User#${userId} is not a member of the channel.`);
            return false;
        }
    })
    .catch((error) => {
        // Handle errors, such as the bot not being an administrator in the channel
        logger.error(`Telegram Bot Api Error: ${error.message}`);
        return false;
    });

// bot.sendMessage(7449972885, "This is the test.")
//     .then((response) => {
//         logger.info(`Message sent successfully: ${response}`);
//     })
//     .catch((error) => {
//         logger.error(`Error sending message ${error}`);
//     });

module.exports.sendMessageToAdmins = (text, channelId = CHANNEL_ID) => bot.getChatAdministrators(channelId)
    .then(administrators => {
        const promises = administrators.map(admin => {
            if (admin.user.is_bot) return Promise.resolve();
            return bot.sendMessage(admin.user.id, text)
                .then((response) => {
                    logger.info(`Message sent successfully: ${response.text}`);
                })
                .catch((error) => {
                    logger.error(`Error sending message: ${error.message}`);
                });
        });
        return Promise.all(promises).then(() => {
            logger.info('All message sent.');
        });
    })
    .catch(error => {
        logger.error(`Error fetching chat administrators: ${error}`);
    });
