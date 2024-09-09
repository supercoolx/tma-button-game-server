require('dotenv').config();

const botStart = () => {
    try {
        
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