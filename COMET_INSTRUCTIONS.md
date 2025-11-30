# Инструкция для агента Comet: Деплой wordcloud-live на GitHub и Render

## Текущая ситуация

Проект `wordcloud-live` готов к деплою:
- ✅ Все файлы закоммичены в локальный Git репозиторий
- ✅ Remote настроен: `https://github.com/SergeySolovyev/wordcloud-live.git`
- ✅ Код исправлен для работы на Render
- ❌ Репозиторий на GitHub ещё не создан
- ❌ Код ещё не отправлен на GitHub
- ❌ Деплой на Render не настроен

## Задача для агента Comet

### Шаг 1: Создать репозиторий на GitHub

**Действие:** Создать пустой репозиторий на GitHub через веб-интерфейс или API

**Параметры:**
- Repository name: `wordcloud-live`
- Owner: `SergeySolovyev`
- Visibility: `public` (или `private` по желанию)
- **ВАЖНО:** Не добавлять README, .gitignore, лицензию (они уже есть в проекте)

**URL для создания:** https://github.com/new

**Альтернатива через API (если есть токен):**
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"wordcloud-live","private":false}'
```

### Шаг 2: Отправить код на GitHub

**Действие:** Выполнить git push после создания репозитория

**Команды:**
```bash
cd C:\Users\1\wordcloud-live
git remote set-url origin https://github.com/SergeySolovyev/wordcloud-live.git
git push -u origin main
```

**Ожидаемый результат:** Код успешно отправлен, репозиторий доступен по адресу https://github.com/SergeySolovyev/wordcloud-live

### Шаг 3: Настроить деплой на Render

**Действие:** Создать Web Service на Render.com

**Параметры деплоя:**
- **Service Type:** Web Service
- **Name:** `wordcloud-live`
- **Region:** любой (ближе к аудитории)
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

**URL для создания:** https://dashboard.render.com/new/web

**Процесс:**
1. Подключить GitHub аккаунт (если ещё не подключен)
2. Выбрать репозиторий `SergeySolovyev/wordcloud-live`
3. Заполнить параметры выше
4. Нажать "Create Web Service"

**Ожидаемый результат:** 
- Сервис задеплоен и доступен по адресу `https://wordcloud-live-xxxxx.onrender.com`
- Страницы доступны:
  - `/screen` - экран с вопросом + QR
  - `/cloud` - живое облако слов
  - `/vote` - страница ответа

## Проверка работоспособности

После деплоя проверить:
1. `https://ваш-сервис.onrender.com/api/health` - должен вернуть `{"status":"ok",...}`
2. `https://ваш-сервис.onrender.com/screen` - должна открыться страница с вопросом
3. `https://ваш-сервис.onrender.com/cloud` - должно открыться облако слов
4. `https://ваш-сервис.onrender.com/vote` - должна открыться форма ответа

## Структура проекта

```
wordcloud-live/
├── package.json          # Зависимости: express, socket.io
├── server.js            # Сервер с API и WebSocket
├── .gitignore           # Игнорируемые файлы
└── public/
    ├── screen.html      # Страница с вопросом + QR
    ├── cloud.html       # Живое облако слов
    └── vote.html         # Форма ответа
```

## Важные детали

1. **Порт:** Сервер использует `process.env.PORT` (Render автоматически устанавливает)
2. **Host:** Сервер слушает на `0.0.0.0` (настроено для Render)
3. **WebSocket:** Socket.io настроен и работает на Render (бесплатный план поддерживает)
4. **Статические файлы:** Express раздаёт папку `public/`

## Команды для быстрой проверки

```bash
# Проверить статус Git
git status

# Проверить remote
git remote -v

# Проверить коммиты
git log --oneline

# Попробовать отправить (если репозиторий создан)
git push -u origin main
```

## Примечания

- Если репозиторий уже существует, шаг 1 можно пропустить
- Если деплой на Render уже настроен, он обновится автоматически после push
- На бесплатном плане Render сервер может "засыпать" после простоя (это нормально)

