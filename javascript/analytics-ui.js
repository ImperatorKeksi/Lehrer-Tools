/*
    ╔══════════════════════════════════════════════════╗
    ║  📊 ANALYTICS DASHBOARD UI - Admin Interface    ║
    ║  Visualisierung & Verwaltung der Analytics     ║
    ║                                                  ║
    ║  Entwickler: Nico Kaschube                      ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚══════════════════════════════════════════════════╝
*/

// ==================== ANALYTICS DASHBOARD ====================
// 📊 UI für Analytics-Verwaltung & Visualisierung
// =============================================================================

class AnalyticsDashboard {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.dashboardElement = null;
        this.refreshInterval = null;
        this.autoRefresh = false;
    }
    
    // =========================================================================
    // DASHBOARD ÖFFNEN/SCHLIESSEN
    // =========================================================================
    
    open() {
        // Prüfe Admin-Berechtigung
        if (!this.checkPermission()) {
            alert('🔒 Nur Admins können das Analytics-Dashboard öffnen!');
            return;
        }
        
        // Erstelle Dashboard wenn noch nicht vorhanden
        if (!this.dashboardElement) {
            this.createDashboard();
        }
        
        // Zeige Dashboard
        this.dashboardElement.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Verhindere Scrollen
        
        // Lade Daten
        this.refreshData();
        
        console.log('📊 Analytics-Dashboard geöffnet');
    }
    
    close() {
        if (this.dashboardElement) {
            this.dashboardElement.classList.add('hidden');
            document.body.style.overflow = ''; // Erlaube Scrollen
        }
        
        // Stoppe Auto-Refresh
        this.stopAutoRefresh();
        
        console.log('📊 Analytics-Dashboard geschlossen');
    }
    
    checkPermission() {
        // Prüfe ob authManager existiert und Benutzer Admin ist
        if (!window.authManager) return false;
        const user = window.authManager.currentUser;
        return user && user.role === 'admin';
    }
    
    // =========================================================================
    // DASHBOARD ERSTELLEN
    // =========================================================================
    
    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'analyticsDashboard';
        dashboard.className = 'modal-overlay hidden';
        dashboard.innerHTML = `
            <div class="analytics-modal">
                <div class="analytics-header">
                    <h2>📊 Analytics Dashboard</h2>
                    <div class="analytics-controls">
                        <label class="toggle-label">
                            <input type="checkbox" id="analyticsAutoRefresh">
                            <span>Auto-Refresh</span>
                        </label>
                        <button id="analyticsRefresh" class="btn-icon" title="Daten aktualisieren">
                            🔄
                        </button>
                        <button id="analyticsClose" class="btn-icon" title="Schließen">
                            ❌
                        </button>
                    </div>
                </div>
                
                <div class="analytics-tabs">
                    <button class="tab-btn active" data-tab="overview">Übersicht</button>
                    <button class="tab-btn" data-tab="events">Events</button>
                    <button class="tab-btn" data-tab="sessions">Sessions</button>
                    <button class="tab-btn" data-tab="errors">Fehler</button>
                    <button class="tab-btn" data-tab="settings">Einstellungen</button>
                </div>
                
                <div class="analytics-content">
                    <!-- Übersicht Tab -->
                    <div class="tab-content active" data-tab="overview">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">📊</div>
                                <div class="stat-value" id="statTotalEvents">-</div>
                                <div class="stat-label">Total Events</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">👥</div>
                                <div class="stat-value" id="statSessions">-</div>
                                <div class="stat-label">Sessions</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">⚠️</div>
                                <div class="stat-value" id="statErrors">-</div>
                                <div class="stat-label">Fehler</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">📈</div>
                                <div class="stat-value" id="statAvgEvents">-</div>
                                <div class="stat-label">Ø Events/Session</div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <h3>Event-Kategorien</h3>
                            <div id="categoryChart" class="bar-chart"></div>
                        </div>
                        
                        <div class="chart-container">
                            <h3>Top Actions</h3>
                            <div id="actionsChart" class="bar-chart"></div>
                        </div>
                    </div>
                    
                    <!-- Events Tab -->
                    <div class="tab-content" data-tab="events">
                        <div class="filter-bar">
                            <select id="eventCategoryFilter">
                                <option value="">Alle Kategorien</option>
                            </select>
                            <input type="text" id="eventSearchFilter" placeholder="Suche...">
                            <button id="eventFilterApply" class="btn-primary">Filtern</button>
                        </div>
                        <div id="eventsList" class="events-list"></div>
                    </div>
                    
                    <!-- Sessions Tab -->
                    <div class="tab-content" data-tab="sessions">
                        <div id="sessionsList" class="sessions-list"></div>
                    </div>
                    
                    <!-- Fehler Tab -->
                    <div class="tab-content" data-tab="errors">
                        <div id="errorsList" class="errors-list"></div>
                    </div>
                    
                    <!-- Einstellungen Tab -->
                    <div class="tab-content" data-tab="settings">
                        <div class="settings-section">
                            <h3>🔐 Datenschutz & Einstellungen</h3>
                            
                            <div class="setting-item">
                                <label class="toggle-label">
                                    <input type="checkbox" id="settingEnabled">
                                    <span>Analytics aktiviert</span>
                                </label>
                                <p class="setting-desc">Aktiviert das Tracking von Events und Fehlern</p>
                            </div>
                            
                            <div class="setting-item">
                                <label class="toggle-label">
                                    <input type="checkbox" id="settingTrackEvents">
                                    <span>Event-Tracking</span>
                                </label>
                                <p class="setting-desc">Trackt Benutzer-Interaktionen und Gameplay-Events</p>
                            </div>
                            
                            <div class="setting-item">
                                <label class="toggle-label">
                                    <input type="checkbox" id="settingTrackErrors">
                                    <span>Error-Tracking</span>
                                </label>
                                <p class="setting-desc">Trackt JavaScript-Fehler automatisch</p>
                            </div>
                            
                            <div class="setting-item">
                                <label class="toggle-label">
                                    <input type="checkbox" id="settingTrackPerformance">
                                    <span>Performance-Tracking</span>
                                </label>
                                <p class="setting-desc">Misst Ladezeiten und Performance-Metriken</p>
                            </div>
                            
                            <div class="setting-item">
                                <label class="toggle-label">
                                    <input type="checkbox" id="settingAnonymize">
                                    <span>Daten anonymisieren</span>
                                </label>
                                <p class="setting-desc">Entfernt persönliche Daten aus Events (DSGVO)</p>
                            </div>
                            
                            <div class="setting-item">
                                <label>Daten-Aufbewahrung (Tage):</label>
                                <input type="number" id="settingRetentionDays" min="1" max="365" value="30">
                                <p class="setting-desc">Ältere Daten werden automatisch gelöscht</p>
                            </div>
                            
                            <div class="settings-actions">
                                <button id="settingsSave" class="btn-primary">💾 Einstellungen speichern</button>
                                <button id="settingsExport" class="btn-secondary">📥 Daten exportieren</button>
                                <button id="settingsDelete" class="btn-danger">🗑️ Alle Daten löschen</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        this.dashboardElement = dashboard;
        
        // Event Listeners
        this.setupEventListeners();
        
        console.log('📊 Dashboard UI erstellt');
    }
    
    // =========================================================================
    // EVENT LISTENERS
    // =========================================================================
    
    setupEventListeners() {
        // Schließen
        document.getElementById('analyticsClose').addEventListener('click', () => this.close());
        
        // Overlay-Click zum Schließen
        this.dashboardElement.addEventListener('click', (e) => {
            if (e.target === this.dashboardElement) {
                this.close();
            }
        });
        
        // Refresh
        document.getElementById('analyticsRefresh').addEventListener('click', () => this.refreshData());
        
        // Auto-Refresh Toggle
        document.getElementById('analyticsAutoRefresh').addEventListener('change', (e) => {
            this.autoRefresh = e.target.checked;
            if (this.autoRefresh) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        });
        
        // Tab-Switching
        const tabButtons = this.dashboardElement.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Settings
        document.getElementById('settingsSave').addEventListener('click', () => this.saveSettings());
        document.getElementById('settingsExport').addEventListener('click', () => this.exportData());
        document.getElementById('settingsDelete').addEventListener('click', () => this.deleteAllData());
    }
    
    // =========================================================================
    // TAB SWITCHING
    // =========================================================================
    
    switchTab(tabName) {
        // Update Tab-Buttons
        this.dashboardElement.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update Tab-Content
        this.dashboardElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
        
        // Lade Tab-spezifische Daten
        this.loadTabData(tabName);
    }
    
    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadOverview();
                break;
            case 'events':
                this.loadEvents();
                break;
            case 'sessions':
                this.loadSessions();
                break;
            case 'errors':
                this.loadErrors();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    // =========================================================================
    // DATEN LADEN
    // =========================================================================
    
    refreshData() {
        const activeTab = this.dashboardElement.querySelector('.tab-btn.active').dataset.tab;
        this.loadTabData(activeTab);
        console.log('🔄 Dashboard-Daten aktualisiert');
    }
    
    loadOverview() {
        const stats = this.analytics.getStatistics();
        
        // Update Stat Cards
        document.getElementById('statTotalEvents').textContent = stats.totalEvents.toLocaleString();
        document.getElementById('statSessions').textContent = stats.sessionCount.toLocaleString();
        document.getElementById('statErrors').textContent = stats.errorCount.toLocaleString();
        document.getElementById('statAvgEvents').textContent = stats.averageEventsPerSession.toLocaleString();
        
        // Render Category Chart
        this.renderCategoryChart(stats.categories);
        
        // Render Top Actions
        this.renderTopActions(stats.categories);
    }
    
    renderCategoryChart(categories) {
        const container = document.getElementById('categoryChart');
        container.innerHTML = '';
        
        // Sortiere Kategorien nach Count
        const sorted = Object.entries(categories)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10); // Top 10
        
        if (sorted.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Daten verfügbar</p>';
            return;
        }
        
        const maxCount = sorted[0][1].count;
        
        sorted.forEach(([category, data]) => {
            const bar = document.createElement('div');
            bar.className = 'bar-item';
            
            const percentage = (data.count / maxCount) * 100;
            
            bar.innerHTML = `
                <div class="bar-label">${category}</div>
                <div class="bar-visual">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${data.count}</div>
                </div>
            `;
            
            container.appendChild(bar);
        });
    }
    
    renderTopActions(categories) {
        const container = document.getElementById('actionsChart');
        container.innerHTML = '';
        
        // Sammle alle Actions
        const allActions = [];
        Object.entries(categories).forEach(([category, data]) => {
            Object.entries(data.actions).forEach(([action, count]) => {
                allActions.push({ category, action, count });
            });
        });
        
        // Sortiere und nimm Top 10
        const sorted = allActions.sort((a, b) => b.count - a.count).slice(0, 10);
        
        if (sorted.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Daten verfügbar</p>';
            return;
        }
        
        const maxCount = sorted[0].count;
        
        sorted.forEach(item => {
            const bar = document.createElement('div');
            bar.className = 'bar-item';
            
            const percentage = (item.count / maxCount) * 100;
            
            bar.innerHTML = `
                <div class="bar-label">${item.category} › ${item.action}</div>
                <div class="bar-visual">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${item.count}</div>
                </div>
            `;
            
            container.appendChild(bar);
        });
    }
    
    loadEvents() {
        const data = this.analytics.loadData();
        const container = document.getElementById('eventsList');
        container.innerHTML = '';
        
        if (data.events.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Events verfügbar</p>';
            return;
        }
        
        // Zeige nur die letzten 50 Events
        const recentEvents = data.events.slice(-50).reverse();
        
        recentEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-header">
                    <span class="event-category">${event.category}</span>
                    <span class="event-action">${event.action}</span>
                    <span class="event-time">${new Date(event.timestamp).toLocaleString('de-DE')}</span>
                </div>
                <div class="event-data">
                    <pre>${JSON.stringify(event.data, null, 2)}</pre>
                </div>
            `;
            container.appendChild(eventCard);
        });
    }
    
    loadSessions() {
        const stats = this.analytics.getStatistics();
        const container = document.getElementById('sessionsList');
        container.innerHTML = '';
        
        const sessions = Object.entries(stats.sessions);
        
        if (sessions.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Sessions verfügbar</p>';
            return;
        }
        
        sessions.reverse().forEach(([sessionId, data]) => {
            const start = new Date(data.start);
            const end = new Date(data.end);
            const duration = end - start;
            
            const sessionCard = document.createElement('div');
            sessionCard.className = 'session-card';
            sessionCard.innerHTML = `
                <div class="session-header">
                    <span class="session-id">${sessionId}</span>
                    <span class="session-events">${data.events} Events</span>
                </div>
                <div class="session-details">
                    <span>⏰ Start: ${start.toLocaleString('de-DE')}</span>
                    <span>⏱️ Dauer: ${this.analytics.formatDuration(duration)}</span>
                </div>
            `;
            container.appendChild(sessionCard);
        });
    }
    
    loadErrors() {
        const stats = this.analytics.getStatistics();
        const container = document.getElementById('errorsList');
        container.innerHTML = '';
        
        if (stats.errors.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Fehler (Super! 🎉)</p>';
            return;
        }
        
        stats.errors.reverse().forEach(error => {
            const errorCard = document.createElement('div');
            errorCard.className = 'error-card';
            errorCard.innerHTML = `
                <div class="error-header">
                    <span class="error-type">⚠️ ${error.type}</span>
                    <span class="error-time">${new Date(error.timestamp).toLocaleString('de-DE')}</span>
                </div>
                <div class="error-message">${error.message}</div>
            `;
            container.appendChild(errorCard);
        });
    }
    
    loadSettings() {
        const settings = this.analytics.settings;
        
        document.getElementById('settingEnabled').checked = settings.enabled;
        document.getElementById('settingTrackEvents').checked = settings.trackEvents;
        document.getElementById('settingTrackErrors').checked = settings.trackErrors;
        document.getElementById('settingTrackPerformance').checked = settings.trackPerformance;
        document.getElementById('settingAnonymize').checked = settings.anonymizeData;
        document.getElementById('settingRetentionDays').value = settings.retentionDays;
    }
    
    // =========================================================================
    // SETTINGS ACTIONS
    // =========================================================================
    
    saveSettings() {
        this.analytics.settings.enabled = document.getElementById('settingEnabled').checked;
        this.analytics.settings.trackEvents = document.getElementById('settingTrackEvents').checked;
        this.analytics.settings.trackErrors = document.getElementById('settingTrackErrors').checked;
        this.analytics.settings.trackPerformance = document.getElementById('settingTrackPerformance').checked;
        this.analytics.settings.anonymizeData = document.getElementById('settingAnonymize').checked;
        this.analytics.settings.retentionDays = parseInt(document.getElementById('settingRetentionDays').value);
        
        this.analytics.saveSettings();
        
        alert('✅ Einstellungen gespeichert!');
        console.log('💾 Analytics-Einstellungen gespeichert');
    }
    
    exportData() {
        const exportData = this.analytics.exportData();
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📥 Analytics-Daten exportiert');
    }
    
    deleteAllData() {
        if (!confirm('⚠️ WARNUNG: Alle Analytics-Daten werden gelöscht!\n\nDies kann nicht rückgängig gemacht werden.\n\nFortfahren?')) {
            return;
        }
        
        this.analytics.clearAllData();
        this.refreshData();
        
        alert('🗑️ Alle Analytics-Daten wurden gelöscht!');
        console.log('🗑️ Analytics-Daten gelöscht');
    }
    
    // =========================================================================
    // AUTO-REFRESH
    // =========================================================================
    
    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear existing interval
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 10000); // 10 Sekunden
        console.log('🔄 Auto-Refresh aktiviert');
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// =========================================================================
// GLOBAL EXPORT
// =========================================================================

// Erstelle globale Instanz
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.analyticsManager) {
            window.analyticsDashboard = new AnalyticsDashboard(window.analyticsManager);
        }
    });
} else {
    if (window.analyticsManager) {
        window.analyticsDashboard = new AnalyticsDashboard(window.analyticsManager);
    } else {
        // Warte auf analyticsManager
        const checkManager = setInterval(() => {
            if (window.analyticsManager) {
                window.analyticsDashboard = new AnalyticsDashboard(window.analyticsManager);
                clearInterval(checkManager);
            }
        }, 100);
    }
}
