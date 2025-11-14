document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetchSlots');
    const toggleJsonButton = document.getElementById('toggleJson');
    const rawJsonPre = document.getElementById('rawJson');
    const showOnlyAvailableCheckbox = document.getElementById('showOnlyAvailable');

    let currentSlots = [];

    // Обработчик кнопки "Получить слоты"
    fetchButton.addEventListener('click', async () => {
        const token = document.getElementById('apiToken').value.trim();
        const warehouseIds = document.getElementById('warehouseIds').value.trim();

        // Валидация
        if (!token) {
            alert('⚠️ Введите API токен');
            return;
        }

        // Скрываем предыдущие результаты
        UI.toggle('summary', false);
        UI.toggle('tableSection', false);
        UI.toggle('jsonSection', false);
        UI.showLoading(true);

        try {
            // Отправляем запрос на наш backend
            const response = await fetch('/api/slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    warehouseIds: warehouseIds
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            const { summary, slots } = result.data;
            currentSlots = slots;

            // Отображаем результаты
            UI.showSummary(summary);
            UI.showTable(slots, showOnlyAvailableCheckbox.checked);
            UI.showJson(result.data);

            console.log('Получено слотов:', slots.length);
            console.log('Доступных:', result.data.available);

        } catch (error) {
            console.error('Ошибка:', error);
            UI.showError(error.message);
        } finally {
            UI.showLoading(false);
        }
    });

    // Показать/скрыть JSON
    toggleJsonButton.addEventListener('click', () => {
        rawJsonPre.classList.toggle('hidden');
    });

    // Фильтр "Только доступные"
    showOnlyAvailableCheckbox.addEventListener('change', (e) => {
        if (currentSlots.length > 0) {
            UI.showTable(currentSlots, e.target.checked);
        }
    });

    // Enter для отправки формы
    document.getElementById('apiToken').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchButton.click();
        }
    });

    document.getElementById('warehouseIds').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchButton.click();
        }
    });
});