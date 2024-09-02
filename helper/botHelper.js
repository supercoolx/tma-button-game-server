require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN);

module.exports.isUserJoined = (userId, channelId = '-1002154994416') => bot.getChatMember(channelId, userId)
    .then((chatMember) => {
        if (chatMember.status === 'member' || chatMember.status === 'creator' || chatMember.status === 'administrator') {
            console.log(`User#${userId} is a ${chatMember.status} of the channel.`,);
            return true;
        } else {
            console.log(`User#${userId} is not a member of the channel.`);
            return false;
        }
    })
    .catch((error) => {
        // Handle errors, such as the bot not being an administrator in the channel
        console.error(error.message);
        return false;
    });