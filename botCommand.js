require('dotenv').config();
// database
const connectDB = require('./db/connect');
const User = require('./models/User');
const { sendMessageToAdmins } = require('./helper/botHelper');


const botStart = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        const { Bot, InlineKeyboard } = require("grammy");
        const gameBot = new Bot(process.env.BOT_TOKEN);

        gameBot.command('start', async (ctx) => {
            const keyboard = new InlineKeyboard()
                .webApp('Play 🔘', 'https://pocketbotdev9.com/')
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
            console.log("/users command start");
            try {
                // Get total user count
                const totalUsers = await User.countDocuments();
                // Get the count of users with score greater than 0
                const usersWithScore = await User.countDocuments({ score: { $gt: 0 } });

                const jMsg = `Total users: ${totalUsers}\n\r This week users: ${usersWithScore}`;
                console.log(jMsg);
                await sendMessageToAdmins(jMsg);
                console.log('Send users count message to admins.');
            } catch (err) {
                console.error('Error /users command:', err);
            }
        });
        
        (async () => {
            await gameBot.api.deleteWebhook();
            gameBot.start();
            console.log('Game Command Bot started!');
        })();
    } catch(err) {
        console.log('Game Command bot error:', err);
    }
}

botStart();