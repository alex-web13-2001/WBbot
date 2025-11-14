const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Маршрут не найден'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

// Запуск сервера
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 WB Bot Server запущен!           ║
╠════════════════════════════════════════╣
║   🌐 URL: http://localhost:${PORT}      ║
║   📊 Режим: ${config.server.env}           ║
║   ⏰ Время: ${new Date().toLocaleString('ru-RU')} ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;