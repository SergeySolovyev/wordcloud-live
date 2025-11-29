const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// При заходе на корень редиректим на страницу с вопросом
app.get('/', (req, res) => {
  res.redirect('/screen');
});

// Красивые пути без .html
app.get('/screen', (req, res) => {
  res.sendFile(path.join(publicPath, 'screen.html'));
});

app.get('/cloud', (req, res) => {
  res.sendFile(path.join(publicPath, 'cloud.html'));
});

app.get('/vote', (req, res) => {
  res.sendFile(path.join(publicPath, 'vote.html'));
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

// Простейшая нормализация русского текста
function normalizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"«»„…]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Конфиг для фронта
app.get('/api/config', (req, res) => {
  res.json({
    question: QUESTION,
    options: DEFAULT_OPTIONS
  });
});

// Принимаем один ответ (готовый вариант или свой текст)
app.post('/api/answer', (req, res) => {
  const { text } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Пустой ответ' });
  }

  const words = normalizeText(text);

  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Рассылаем всем новое состояние облака
  io.emit('wordcloud:update', wordCounts);

  res.json({ ok: true });
});

// Сбросить все ответы (если захочешь делать новый раунд)
app.post('/api/reset', (req, res) => {
  wordCounts = {};
  io.emit('wordcloud:update', wordCounts);
  res.json({ ok: true });
});

// WebSocket-подключения
io.on('connection', (socket) => {
  // При подключении сразу отправляем текущее состояние
  socket.emit('wordcloud:update', wordCounts);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен:  http://localhost:${PORT}`);
  console.log(`Вопрос + QR:     http://localhost:${PORT}/screen`);
  console.log(`Живое облако:    http://localhost:${PORT}/cloud`);
  console.log(`Страница ответа: http://localhost:${PORT}/vote`);
});

