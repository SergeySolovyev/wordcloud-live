const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Настройка для работы за прокси (Render.com)
app.set('trust proxy', true);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.redirect('/screen');
});

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

const QUESTION = 'Как Вы считаете, ИИ для Вас как профессионала:';

const DEFAULT_OPTIONS = [
  'Опасность',
  'Возможность',
  'Пока не актуален'
];

let wordCounts = {};
const votedIPs = new Set();

function normalizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"«»„…]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/config', (req, res) => {
  res.json({
    question: QUESTION,
    options: DEFAULT_OPTIONS
  });
});

function getClientIP(req) {
  // Проверяем x-forwarded-for (для Render.com и других прокси)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0] || 'unknown';
  }
  
  // Проверяем x-real-ip
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Используем Express req.ip (работает с trust proxy)
  if (req.ip) {
    return req.ip;
  }
  
  // Fallback на connection/socket
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
}

app.post('/api/answer', (req, res) => {
  const { text } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Пустой ответ' });
  }

  const clientIP = getClientIP(req);
  
  // Проверяем, не голосовал ли уже этот IP
  if (votedIPs.has(clientIP)) {
    return res.status(403).json({
      error: 'Вы уже проголосовали. Один человек может проголосовать только один раз.',
      alreadyVoted: true
    });
  }

  // Добавляем IP в список проголосовавших
  votedIPs.add(clientIP);

  // Проверяем, является ли ответ точным совпадением с одним из вариантов
  const trimmedText = text.trim();
  const isExactMatch = DEFAULT_OPTIONS.some(opt => 
    opt.toLowerCase() === trimmedText.toLowerCase()
  );

  if (isExactMatch) {
    // Если это точное совпадение, сохраняем как одно слово (с оригинальным регистром)
    const exactOption = DEFAULT_OPTIONS.find(opt => 
      opt.toLowerCase() === trimmedText.toLowerCase()
    );
    wordCounts[exactOption] = (wordCounts[exactOption] || 0) + 1;
  } else {
    // Иначе разбиваем на слова как раньше
    const words = normalizeText(text);
    words.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  }

  io.emit('wordcloud:update', wordCounts);

  res.json({ ok: true });
});

app.post('/api/reset', (req, res) => {
  wordCounts = {};
  votedIPs.clear();
  io.emit('wordcloud:update', wordCounts);
  // Отправляем событие сброса, чтобы все клиенты очистили localStorage
  io.emit('wordcloud:reset');
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  socket.emit('wordcloud:update', wordCounts);
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Сервер запущен на ${HOST}:${PORT}`);
  console.log(`Вопрос + QR:     http://localhost:${PORT}/screen`);
  console.log(`Живое облако:    http://localhost:${PORT}/cloud`);
  console.log(`Страница ответа: http://localhost:${PORT}/vote`);
});

