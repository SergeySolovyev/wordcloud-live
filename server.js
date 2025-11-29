const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Настройка Socket.io для работы на Render
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'], // Поддержка polling как fallback
  allowEIO3: true
});

app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// При заходе на корень редиректим на страницу с вопросом
app.get('/', (req, res) => {
  res.redirect('/screen');
});

// Красивые пути без .html
app.get('/screen', (req, res) => {
  res.sendFile(path.join(publicPath, 'screen.html'), (err) => {
    if (err) {
      console.error('Error sending screen.html:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/cloud', (req, res) => {
  res.sendFile(path.join(publicPath, 'cloud.html'), (err) => {
    if (err) {
      console.error('Error sending cloud.html:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('/vote', (req, res) => {
  res.sendFile(path.join(publicPath, 'vote.html'), (err) => {
    if (err) {
      console.error('Error sending vote.html:', err);
      res.status(500).send('Error loading page');
    }
  });
});

// --- Конфиг опроса ---

const QUESTION = 'Какое слово у вас ассоциируется с нашим событием?';

const DEFAULT_OPTIONS = [
  'Интересно',
  'Полезно',
  'Скучно',
  'Сложно'
];

// Частоты слов в памяти
let wordCounts = {};

// Хранилище уже проголосовавших (IP-адреса)
// В продакшене лучше использовать Redis или БД, но для MVP хватит памяти
const votedIPs = new Set();

// Простейшая нормализация русского текста
function normalizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"«»„…]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Тестовый эндпоинт для проверки работоспособности
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Конфиг для фронта
app.get('/api/config', (req, res) => {
  res.json({
    question: QUESTION,
    options: DEFAULT_OPTIONS
  });
});

// Получаем IP-адрес клиента (учитываем прокси Render)
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         'unknown';
}

// Принимаем один ответ (готовый вариант или свой текст)
app.post('/api/answer', (req, res) => {
  const { text } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Пустой ответ' });
  }

  // Проверяем, не голосовал ли уже этот IP
  const clientIP = getClientIP(req);
  
  if (votedIPs.has(clientIP)) {
    console.log('Попытка повторного голосования с IP:', clientIP);
    return res.status(403).json({ 
      error: 'Вы уже проголосовали. Один человек может проголосовать только один раз.' 
    });
  }

  // Добавляем IP в список проголосовавших
  votedIPs.add(clientIP);
  console.log('Новое голосование с IP:', clientIP);

  const words = normalizeText(text);

  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Рассылаем всем новое состояние облака
  console.log('Новое голосование, слова:', words);
  console.log('Текущие счетчики:', wordCounts);
  io.emit('wordcloud:update', wordCounts);
  console.log('Обновление отправлено всем клиентам');

  res.json({ ok: true });
});

// Сбросить все ответы (если захочешь делать новый раунд)
app.post('/api/reset', (req, res) => {
  wordCounts = {};
  votedIPs.clear(); // Очищаем список проголосовавших
  io.emit('wordcloud:update', wordCounts);
  console.log('Облако и список голосов сброшены');
  res.json({ ok: true });
});

// WebSocket-подключения
io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);
  
  // При подключении сразу отправляем текущее состояние
  socket.emit('wordcloud:update', wordCounts);
  
  socket.on('disconnect', () => {
    console.log('Отключение:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Сервер запущен на ${HOST}:${PORT}`);
  console.log(`Вопрос + QR:     http://localhost:${PORT}/screen`);
  console.log(`Живое облако:    http://localhost:${PORT}/cloud`);
  console.log(`Страница ответа: http://localhost:${PORT}/vote`);
});

