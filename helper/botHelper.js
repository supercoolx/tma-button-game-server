require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN);
// const CHANNEL_ID = '-1002153654987'; //macro
const CHANNEL_ID = '-1002154994416'; //button


module.exports.isUserJoined = (userId, channelId = CHANNEL_ID) => bot.getChatMember(channelId, userId)
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
        console.error('Telegram Bot Api Error:', error.message);
        return false;
    });

// bot.getChatMember(CHANNEL_ID, 7449972885)
//     .then((chatMember) => {
//         if (chatMember.status === 'member' || chatMember.status === 'creator' || chatMember.status === 'administrator') {
//             console.log(`User#${7449972885} is a ${chatMember.status} of the channel.`,);
//             return true;
//         } else {
//             console.log(`User#${7449972885} is not a member of the channel.`);
//             return false;
//         }
//     })
//     .catch((error) => {
//         // Handle errors, such as the bot not being an administrator in the channel
//         console.error('Telegram Bot Api Error:', error.message);
//         return false;
//     });