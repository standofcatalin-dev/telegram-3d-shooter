const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL || 'https://your-domain.com';

if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN не задан в .env');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const app = express();

// === Команда /start ===
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Игрок';

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🎮 Играть',
                    web_app: { url: webAppUrl }
                }
            ],
            [
                {
                    text: '📊 Мой счет',
                    callback_data: 'score'
                },
                {
                    text: '👥 Лидерборд',
                    callback_data: 'leaderboard'
                }
            ]
        ]
    };

    const message = `
🎮 Добро пожаловать, ${userName}!

Это 3D платформер для Telegram.

⌨️ Управление:
• WASD — движение
• Space — прыжок
• Mouse — камера

🎯 Цель: добраться до золотой платформы на конце уровня!

Нажми кнопку ниже, чтобы начать игру:
    `.trim();

    bot.sendMessage(chatId, message, { reply_markup: keyboard });
});

// === Callback обработчик ===
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'score') {
        bot.answerCallbackQuery(query.id);
        bot.sendMessage(
            chatId,
            '📊 Ваш счет:\n\n' +
            '⏱️ Лучшее время: —\n' +
            '🏆 Очков: 0\n\n' +
            'Пройдите уровень, чтобы получить очки!'
        );
    } else if (data === 'leaderboard') {
        bot.answerCallbackQuery(query.id);
        bot.sendMessage(
            chatId,
            '👥 Лидерборд:\n\n' +
            '🥇 #1 Player1 — 1000 очков ⚡\n' +
            '🥈 #2 Player2 — 850 очков 🔥\n' +
            '🥉 #3 Player3 — 720 очков 💫\n\n' +
            'Получайте очки, проходя уровни!'
        );
    }
});

// === Webhook endpoint (для боевого использования) ===
app.use(express.json());

app.post(`/webhook/${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// === Health check ===
app.get('/', (req, res) => {
    res.send('✅ 3D Platformer Telegram Bot запущен и готов!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Bot слушает на порту ${PORT}`);
    console.log(`🎮 Web App URL: ${webAppUrl}`);
});