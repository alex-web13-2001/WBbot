const UI = {
    // Показать/скрыть элемент
    toggle(elementId, show) {
        const el = document.getElementById(elementId);
        if (el) {
            if (show) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    },

    // Показать загрузку
    showLoading(show = true) {
        this.toggle('loading', show);
    },

    // Отобразить сводку
    showSummary(summary) {
        const summaryContent = document.getElementById('summaryContent');
        
        if (!summary.hasSlots) {
            summaryContent.innerHTML = `
                <div class="alert alert-error">
                    <div class="alert-icon">❌</div>
                    <div class="alert-content">
                        <strong>Нет доступных слотов</strong>
                        <p>На ближайшие 14 дней свободных слотов не найдено</p>
                    </div>
                </div>
            `;
        } else {
            const nearestDate = this.formatDate(new Date(summary.nearestDate));
            
            let html = `
                <div class="alert alert-success">
                    <div class="alert-icon">✅</div>
                    <div class="alert-content">
                        <strong>${summary.message}</strong>
                        <p>Ближайшая доступная дата: <strong>${nearestDate}</strong></p>
                    </div>
                </div>
                <div class="warehouses-grid">
            `;

            summary.warehouses.forEach(warehouse => {
                html += `
                    <div class="warehouse-card">
                        <div class="warehouse-header">
                            <span class="warehouse-icon">📦</span>
                            <strong>${warehouse.name}</strong>
                        </div>
                        <div class="warehouse-id">ID: ${warehouse.id}</div>
                        <div class="warehouse-dates">
                            <strong>Доступные даты:</strong>
                            <ul>
                                ${warehouse.dates.map(d => `
                                    <li>${this.formatDate(new Date(d.date))} (BoxType: ${d.boxTypeID})</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            summaryContent.innerHTML = html;
        }

        this.toggle('summary', true);
    },

    // Отобразить таблицу
    showTable(slots, showOnlyAvailable = true) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        // Фильтрация
        let filteredSlots = slots;
        if (showOnlyAvailable) {
            filteredSlots = slots.filter(s => 
                (s.coefficient === 0 || s.coefficient === 1) && s.allowUnload === true
            );
        }

        // Сортировка по дате
        filteredSlots.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (filteredSlots.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">Нет данных для отображения</td></tr>';
        } else {
            filteredSlots.forEach(slot => {
                const isAvailable = (slot.coefficient === 0 || slot.coefficient === 1) && slot.allowUnload;
                const row = tbody.insertRow();
                row.className = isAvailable ? 'available' : 'unavailable';

                row.innerHTML = `
                    <td>${this.formatDate(new Date(slot.date))}</td>
                    <td><strong>${slot.warehouseName}</strong></td>
                    <td>${slot.warehouseID}</td>
                    <td><span class="badge">${slot.boxTypeID}</span></td>
                    <td><span class="coef coef-${this.getCoefClass(slot.coefficient)}">${slot.coefficient}</span></td>
                    <td>${slot.allowUnload ? '<span class="status-yes">✅ Да</span>' : '<span class="status-no">❌ Нет</span>'}</td>
                `;
            });
        }

        this.toggle('tableSection', true);
    },

    // Показать JSON
    showJson(data) {
        document.getElementById('rawJson').textContent = JSON.stringify(data, null, 2);
        this.toggle('jsonSection', true);
    },

    // Показать ошибку
    showError(message) {
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = `
            <div class="alert alert-error">
                <div class="alert-icon">❌</div>
                <div class="alert-content">
                    <strong>Ошибка</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;
        this.toggle('summary', true);
    },

    // Форматирование даты
    formatDate(date) {
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
        });
    },

    // Класс для коэффициента
    getCoefClass(coef) {
        if (coef === 0 || coef === 1) return 'good';
        if (coef === -1) return 'bad';
        return 'neutral';
    }
};