const express = require('express');
const router = express.Router();
const wbApi = require('../services/wbApi');

/**
 * GET /api/slots
 * Получить слоты приёмки
 */
router.post('/slots', async (req, res) => {
    try {
        const { token, warehouseIds } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'API токен обязателен'
            });
        }

        // Получаем данные от WB
        const slots = await wbApi.getCoefficients(token, warehouseIds);

        // Формируем сводку
        const summary = wbApi.formatSummary(slots);

        res.json({
            success: true,
            data: {
                summary,
                slots,
                total: slots.length,
                available: wbApi.filterAvailableSlots(slots).length
            }
        });

    } catch (error) {
        console.error('Ошибка /api/slots:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/warehouses
 * Получить список складов
 */
router.post('/warehouses', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'API токен обязателен'
            });
        }

        const warehouses = await wbApi.getWarehouses(token);

        res.json({
            success: true,
            data: warehouses
        });

    } catch (error) {
        console.error('Ошибка /api/warehouses:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/health
 * Проверка работоспособности сервера
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;