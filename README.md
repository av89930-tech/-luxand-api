# LUXAND Backend API — Vercel Deployment

## Структура проєкту

```
/api
  ├── telegram.js    # Відправка в Telegram
  ├── generate.js    # Генерація через Gemini
vercel.json         # Конфігурація Vercel
```

## Крок 1: Завантажте файли на Vercel

1. Створіть **новий проєкт** на Vercel або використайте існуючий
2. Завантажте папку `api/` та файл `vercel.json`

**Через GitHub (рекомендовано):**
- Створіть репозиторій на GitHub
- Завантажте туди папку `api/` та `vercel.json`
- На Vercel натисніть **Import Project** → виберіть ваш репозиторій

**Без GitHub:**
- На Vercel натисніть **Add New Project**
- Перетягніть папку з `api/` та `vercel.json`

## Крок 2: Додайте змінні середовища

У налаштуваннях проєкту Vercel → **Settings** → **Environment Variables** додайте:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | `AIzaSyB1JSmy3eDVcsTwjuqHr6LZnbWbQrHPDEY` |
| `TELEGRAM_BOT_TOKEN` | `8718891061:AAGM562d2eINigWggHTCOTxRlO4gkvB_Ndg` |
| `TELEGRAM_CHAT_ID` | `5527792568` |

## Крок 3: Задеплойте

Після додавання змінних натисніть **Deploy**.

Vercel автоматично створить URL типу:
```
https://ваш-проєкт.vercel.app
```

## Крок 4: Оновіть index.html

Замініть у `index.html`:

**Було:**
```javascript
const GEMINI_KEY = 'AIzaSyB...';
const BOT_TOKEN = '8718891061...';
const CHAT_ID = '5527792568';
```

**Стало:**
```javascript
const API_BASE = 'https://ваш-проєкт.vercel.app/api';
```

І замініть всі виклики API на:
- `fetch(API_BASE + '/telegram', ...)` — замість прямих викликів до Telegram
- `fetch(API_BASE + '/generate', ...)` — замість прямих викликів до Gemini

## Готово! 🎉

Тепер API ключі захищені — їх ніхто не побачить у коді сторінки.
