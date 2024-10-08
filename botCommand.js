require('dotenv').config();
// database
const connectDB = require('./db/connect');
const User = require('./models/User');
const { sendMessageToAdmins } = require('./helper/botHelper');
const logger = require('./helper/logger');

const botStart = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        const { Bot, InlineKeyboard } = require("grammy");
        const gameBot = new Bot(process.env.BOT_TOKEN);

        gameBot.command('start', async (ctx) => {
            const keyboard = new InlineKeyboard()
                .webApp('Play 🔘', 'https://jackpot.pocketbotdev9.com/')
                .row()
                .url('Join channel', 'https://t.me/thebuttoncoin')

            await ctx.replyWithPhoto(
                'https://ibb.co/0VmWGGJ',
                {
                    caption: 'Hello! Welcome to Buttoncoin 🔘\n\rIn this game you can click your way to the high score to win big prizes!\n\rJoin the journey of the Buttoncoin token launch (dates coming soon)\n\rDon\'t forget to invite your friends and win together!',
                    reply_markup: keyboard,
                }
            );
        });
        gameBot.command('users', async (ctx) => {
            logger.info("/users command start");
            try {
                // Get total user count
                const totalUsers = await User.countDocuments();
                // Get the count of users with score greater than 0
                const usersWithScore = await User.countDocuments({ score: { $gt: 0 } });

                const jMsg = `Total users: ${totalUsers}\n\r This week users: ${usersWithScore}`;
                logger.info(jMsg);
                await sendMessageToAdmins(jMsg);
                logger.info('Send users count message to admins.');
            } catch (err) {
                logger.error(['Error /users command:', err]);
            }
        });
        
        (async () => {
            await gameBot.api.deleteWebhook();
            gameBot.start();
            logger.info('Game Command Bot started!');
        })();
    } catch(err) {
        logger.error(['Game Command bot error:', err]);
    }
}

botStart();