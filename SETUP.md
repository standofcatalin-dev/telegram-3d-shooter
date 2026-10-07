# 🚀 Быстрый старт

## Локальный запуск

### 1️⃣ Фронтенд (игра)

```bash
# Любой HTTP сервер
python -m http.server 8000
# или
npx http-server

# Откройте http://localhost:8000
```

### 2️⃣ Бэкенд (бот)

```bash
# Установка зависимостей
npm install

# Создать .env из примера
cp .env.example .env

# Добавить токен бота (см. ниже)
# Отредактировать WEB_APP_URL на http://localhost:8000

# Запуск
npm start
```

## Получение токена Telegram

1. Откройте `@BotFather` в Telegram
2. Напишите `/newbot`
3. Придумайте имя и юзернейм бота
4. Скопируйте токен
5. Вставьте в `.env` как `TELEGRAM_BOT_TOKEN=...`

## Деплой

### Вариант 1: Vercel (фронтенд)

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel

# Скопировать URL (например: https://telegram-3d-shooter.vercel.app)
```

### Вариант 2: Netlify (фронтенд)

1. Заливаешь на GitHub
2. Подключаешь к Netlify через UI
3. Получаешь URL

### Вариант 3: Railway (бэкенд)

1. Создаешь аккаунт на https://railway.app
2. Заливаешь репо на GitHub
3. Подключаешь к Railway
4. Добавляешь переменные окружения (.env)
5. Получаешь URL

## Финальная настройка бота

Когда у тебя есть URL фронтенда и бэкенда:

1. Обновить `.env`:
```
TELEGRAM_BOT_TOKEN=xxx
WEB_APP_URL=https://telegram-3d-shooter.vercel.app
PORT=3000
```

2. Запустить бот

3. Найти бота в Telegram и нажать `/start`

4. Нажать "🎮 Играть" — откроется мини-приложение с игрой

## Архитектура

```
telegram-3d-shooter/
├── index.html           # Точка входа игры
├── style.css            # Стили
├── js/
│   └── game.js         # Three.js игра
├── bot.js              # Telegram Bot
├── package.json        # Зависимости
└── .env               # Конфиг (локально)
```

## Что дальше?

### Добавить:
- 🎵 Звуки
- 🏆 Сохранение рекордов
- 👥 Мультиплеер
- 🎨 Кастомизация персонажа
- 💰 Монеты на уровнях
- 👹 Враги
- 🔫 Стрельба

Дай знать, если нужна помощь с любым из этого!
