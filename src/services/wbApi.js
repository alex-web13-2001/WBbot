const axios = require('axios');
const config = require('../config/config');

class WBApiService {
    constructor() {
        this.baseUrl = config.wb.baseUrl;
    }

    /**
     * Получить коэффициенты приёмки
     * @param {string} token - WB API токен
     * @param {string} warehouseIds - ID складов через запятую (опционально)
     * @returns {Promise<Array>} - Массив слотов
     */
    async getCoefficients(token, warehouseIds = '') {
        try {
            const url = `${this.baseUrl}/acceptance/coefficients`;
            const params = warehouseIds ? { warehouseIDs: warehouseIds } : {};

            const response = await axios.get(url, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                params
            });

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Получить список складов
     * @param {string} token - WB API токен
     * @returns {Promise<Array>} - Массив складов
     */
    async getWarehouses(token) {
        try {
            const url = `${this.baseUrl}/warehouses`;

            const response = await axios.get(url, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Фильтровать доступные слоты
     * @param {Array} slots - Массив слотов
     * @returns {Array} - Только доступные слоты
     */
    filterAvailableSlots(slots) {
        return slots.filter(slot => 
            (slot.coefficient === 0 || slot.coefficient === 1) && 
            slot.allowUnload === true
        );
    }

    /**
     * Форматировать сводку по слотам
     * @param {Array} slots - Массив слотов
     * @returns {Object} - Сводная информация
     */
    formatSummary(slots) {
        const available = this.filterAvailableSlots(slots);

        if (available.length === 0) {
            return {
                hasSlots: false,
                message: 'Нет доступных слотов на ближайшие 14 дней',
                warehouses: []
            };
        }

        // Группируем по складам
        const warehouses = {};
        available.forEach(slot => {
            if (!warehouses[slot.warehouseName]) {
                warehouses[slot.warehouseName] = {
                    id: slot.warehouseID,
                    name: slot.warehouseName,
                    dates: []
                };
            }
            warehouses[slot.warehouseName].dates.push({
                date: slot.date,
                boxTypeID: slot.boxTypeID
            });
        });

        // Находим ближайшую дату
        const dates = available.map(s => new Date(s.date));
        const nearestDate = new Date(Math.min(...dates));

        return {
            hasSlots: true,
            message: `Найдены свободные слоты: ${Object.keys(warehouses).length} склад(ов)`,
            nearestDate: nearestDate.toISOString(),
            warehouseCount: Object.keys(warehouses).length,
            warehouses: Object.values(warehouses)
        };
    }

    /**
     * Обработка ошибок API
     * @param {Error} error - Объект ошибки
     */
    handleError(error) {
        if (error.response) {
            const status = error.response.status;
            let message = 'Ошибка API';

            switch (status) {
                case 401:
                    message = 'Неверный API токен';
                    break;
                case 429:
                    message = 'Превышен лимит запросов (максимум 6/мин)';
                    break;
                case 400:
                    message = 'Неверный запрос';
                    break;
                case 500:
                    message = 'Ошибка сервера Wildberries';
                    break;
            }

            throw new Error(`${message} (HTTP ${status})`);
        } else if (error.request) {
            throw new Error('Нет ответа от сервера Wildberries');
        } else {
            throw new Error(`Ошибка запроса: ${error.message}`);
        }
    }
}

module.exports = new WBApiService();