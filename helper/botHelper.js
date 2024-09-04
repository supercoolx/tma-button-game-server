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

// bot.sendMessage(7449972885, "This is the test.")
//     .then((response) => {
//         console.log('Message sent successfully:', response);
//     })
//     .catch((error) => {
//         console.error('Error sending message:', error);
//     });

module.exports.sendMessageToAdmins = (text, channelId = CHANNEL_ID) => bot.getChatAdministrators(channelId)
    .then(administrators => {
        const promises = administrators.map(admin => {
            if (admin.user.is_bot) return new Promise(() => {}, () => {});
            return bot.sendMessage(admin.user.id, text)
                .then((response) => {
                    console.log('Message sent successfully:', response.text);
                })
                .catch((error) => {
                    console.error('Error sending message:', error.message);
                });
        });
        return Promise.all(promises).then(() => {
            console.log('All message sent.');
        });
    })
    .catch(error => {
        console.error('Error fetching chat administrators:', error);
    });