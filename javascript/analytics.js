/*
    ╔══════════════════════════════════════════════════╗
    ║  📊 ANALYTICS ENGINE - DSGVO-konform            ║
    ║  Lokales Event-Tracking & Feature-Monitoring    ║
    ║                                                  ║
    ║  ✅ 100% LocalStorage (keine externen Services) ║
    ║  ✅ Opt-in/Opt-out Support                      ║
    ║  ✅ Daten können gelöscht werden                ║
    ║                                                  ║
    ║  Entwickler: Nico Kaschube                      ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚══════════════════════════════════════════════════╝
*/

// ==================== ANALYTICS MANAGER ====================
// 📊 ANALYTICS ENGINE - Lokales Tracking-System
// =============================================================================

class AnalyticsManager {
    constructor() {
        // Storage Keys
        this.storageKey = 'keksi_analytics_data';
        this.settingsKey = 'keksi_analytics_settings';
        this.sessionKey = 'keksi_analytics_session';
        
        // Settings
        this.settings = {
            enabled: false,              // ❌ Standardmäßig AUS (DSGVO!)
            trackEvents: true,           // Event-Tracking
            trackErrors: true,           // Error-Tracking
            trackPerformance: false,     // Performance-Monitoring
            anonymizeData: true,         // Daten anonymisieren
            retentionDays: 30            // Daten-Aufbewahrung (30 Tage)
        };
        
        // Session
        this.sessionId = null;
        this.sessionStart = null;
        
        // Event Queue (für Batch-Processing)
        this.eventQueue = [];
        this.maxQueueSize = 100;
        this.flushInterval = 30000; // 30 Sekunden
        
        // Statistics Cache
        this.statsCache = null;
        this.cacheExpiry = 300000; // 5 Minuten
        
        this.init();
    }
    
    // =========================================================================
    // INITIALISIERUNG
    // =========================================================================
    
    init() {
        this.loadSettings();
        this.loadSession();
        
        if (this.settings.enabled) {
            this.startSession();
            this.setupErrorTracking();
            this.startAutoFlush();
            console.log('📊 Analytics aktiviert (DSGVO-konform)');
        } else {
            console.log('📊 Analytics deaktiviert (Opt-in erforderlich)');
        }
    }
    
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.settingsKey);
            if (stored) {
                this.settings = { ...this.settings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('❌ Analytics-Settings konnten nicht geladen werden:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('❌ Analytics-Settings konnten nicht gespeichert werden:', error);
        }
    }
    
    loadSession() {
        try {
            const stored = localStorage.getItem(this.sessionKey);
            if (stored) {
                const session = JSON.parse(stored);
                // Prüfe ob Session noch gültig (max 24h)
                const age = Date.now() - new Date(session.start).getTime();
                if (age < 86400000) { // 24 Stunden
                    this.sessionId = session.id;
                    this.sessionStart = new Date(session.start);
                }
            }
        } catch (error) {
            console.error('❌ Analytics-Session konnte nicht geladen werden:', error);
        }
    }
    
    // =========================================================================
    // OPT-IN / OPT-OUT (DSGVO!)
    // =========================================================================
    
    enable() {
        this.settings.enabled = true;
        this.saveSettings();
        this.startSession();
        this.setupErrorTracking();
        this.startAutoFlush();
        
        this.trackEvent('analytics', 'enabled', { timestamp: new Date().toISOString() });
        console.log('✅ Analytics aktiviert');
        
        return true;
    }
    
    disable() {
        this.settings.enabled = false;
        this.saveSettings();
        this.stopAutoFlush();
        
        console.log('❌ Analytics deaktiviert');
        return true;
    }
    
    isEnabled() {
        return this.settings.enabled;
    }
    
    // =========================================================================
    // SESSION MANAGEMENT
    // =========================================================================
    
    startSession() {
        this.sessionId = this.generateSessionId();
        this.sessionStart = new Date();
        
        const session = {
            id: this.sessionId,
            start: this.sessionStart.toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        
        this.trackEvent('session', 'start', session);
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    endSession() {
        if (!this.sessionId) return;
        
        const duration = Date.now() - this.sessionStart.getTime();
        this.trackEvent('session', 'end', { 
            sessionId: this.sessionId,
            duration: duration,
            durationFormatted: this.formatDuration(duration)
        });
        
        this.flushQueue();
    }
    
    // =========================================================================
    // EVENT TRACKING
    // =========================================================================
    
    trackEvent(category, action, data = {}) {
        if (!this.settings.enabled || !this.settings.trackEvents) return;
        
        const event = {
            id: this.generateEventId(),
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            category: category,
            action: action,
            data: this.settings.anonymizeData ? this.anonymizeEventData(data) : data
        };
        
        this.eventQueue.push(event);
        
        // Auto-Flush wenn Queue voll
        if (this.eventQueue.length >= this.maxQueueSize) {
            this.flushQueue();
        }
    }
    
    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    anonymizeEventData(data) {
        // Entferne persönliche Daten
        const anonymized = { ...data };
        
        // Liste sensibler Felder
        const sensitiveFields = ['email', 'username', 'password', 'ip', 'userId', 'name'];
        
        sensitiveFields.forEach(field => {
            if (anonymized[field]) {
                delete anonymized[field];
            }
        });
        
        return anonymized;
    }
    
    // =========================================================================
    // ERROR TRACKING
    // =========================================================================
    
    setupErrorTracking() {
        if (!this.settings.trackErrors) return;
        
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'unhandledRejection',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
        });
    }
    
    trackError(errorData) {
        if (!this.settings.enabled || !this.settings.trackErrors) return;
        
        this.trackEvent('error', 'occurred', {
            ...errorData,
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        console.warn('📊 Fehler getrackt:', errorData.message);
    }
    
    // =========================================================================
    // PERFORMANCE TRACKING
    // =========================================================================
    
    trackPerformance(metric, value) {
        if (!this.settings.enabled || !this.settings.trackPerformance) return;
        
        this.trackEvent('performance', metric, { 
            value: value,
            unit: 'ms'
        });
    }
    
    measurePerformance(label, fn) {
        if (!this.settings.trackPerformance) return fn();
        
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        this.trackPerformance(label, duration);
        
        return result;
    }
    
    // =========================================================================
    // DATA PERSISTENCE
    // =========================================================================
    
    flushQueue() {
        if (this.eventQueue.length === 0) return;
        
        try {
            const existingData = this.loadData();
            existingData.events.push(...this.eventQueue);
            
            // Cleanup alter Events (retention policy)
            this.cleanupOldData(existingData);
            
            localStorage.setItem(this.storageKey, JSON.stringify(existingData));
            
            console.log(`📊 ${this.eventQueue.length} Events gespeichert`);
            this.eventQueue = [];
            
            // Invalidate cache
            this.statsCache = null;
            
        } catch (error) {
            console.error('❌ Analytics-Daten konnten nicht gespeichert werden:', error);
            
            // Falls LocalStorage voll ist, lösche älteste Daten
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldDataAggressive();
                this.flushQueue(); // Retry
            }
        }
    }
    
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('❌ Analytics-Daten konnten nicht geladen werden:', error);
        }
        
        return {
            version: '1.0',
            createdAt: new Date().toISOString(),
            events: []
        };
    }
    
    cleanupOldData(data) {
        const retentionMs = this.settings.retentionDays * 86400000; // Tage in Millisekunden
        const cutoffDate = Date.now() - retentionMs;
        
        data.events = data.events.filter(event => {
            const eventDate = new Date(event.timestamp).getTime();
            return eventDate > cutoffDate;
        });
    }
    
    cleanupOldDataAggressive() {
        const data = this.loadData();
        
        // Behalte nur die letzten 30% der Events
        const keepCount = Math.floor(data.events.length * 0.3);
        data.events = data.events.slice(-keepCount);
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        console.warn('⚠️ Aggressive Cleanup durchgeführt (LocalStorage voll)');
    }
    
    startAutoFlush() {
        this.autoFlushTimer = setInterval(() => {
            this.flushQueue();
        }, this.flushInterval);
    }
    
    stopAutoFlush() {
        if (this.autoFlushTimer) {
            clearInterval(this.autoFlushTimer);
            this.autoFlushTimer = null;
        }
    }
    
    // =========================================================================
    // STATISTICS & REPORTING
    // =========================================================================
    
    getStatistics() {
        // Cache prüfen
        if (this.statsCache && Date.now() - this.statsCache.timestamp < this.cacheExpiry) {
            return this.statsCache.data;
        }
        
        const data = this.loadData();
        const stats = {
            totalEvents: data.events.length,
            categories: {},
            sessions: {},
            errors: [],
            timeRange: {
                start: null,
                end: null
            }
        };
        
        // Events analysieren
        data.events.forEach(event => {
            // Kategorien zählen
            if (!stats.categories[event.category]) {
                stats.categories[event.category] = { count: 0, actions: {} };
            }
            stats.categories[event.category].count++;
            
            // Actions zählen
            const action = event.action;
            if (!stats.categories[event.category].actions[action]) {
                stats.categories[event.category].actions[action] = 0;
            }
            stats.categories[event.category].actions[action]++;
            
            // Sessions tracken
            if (event.sessionId) {
                if (!stats.sessions[event.sessionId]) {
                    stats.sessions[event.sessionId] = {
                        events: 0,
                        start: event.timestamp,
                        end: event.timestamp
                    };
                }
                stats.sessions[event.sessionId].events++;
                stats.sessions[event.sessionId].end = event.timestamp;
            }
            
            // Fehler sammeln
            if (event.category === 'error') {
                stats.errors.push({
                    timestamp: event.timestamp,
                    type: event.data.type,
                    message: event.data.message
                });
            }
            
            // Time Range
            if (!stats.timeRange.start || event.timestamp < stats.timeRange.start) {
                stats.timeRange.start = event.timestamp;
            }
            if (!stats.timeRange.end || event.timestamp > stats.timeRange.end) {
                stats.timeRange.end = event.timestamp;
            }
        });
        
        // Zusätzliche Metriken
        stats.sessionCount = Object.keys(stats.sessions).length;
        stats.errorCount = stats.errors.length;
        stats.averageEventsPerSession = stats.sessionCount > 0 
            ? Math.round(stats.totalEvents / stats.sessionCount) 
            : 0;
        
        // Cache speichern
        this.statsCache = {
            timestamp: Date.now(),
            data: stats
        };
        
        return stats;
    }
    
    exportData() {
        const data = this.loadData();
        const stats = this.getStatistics();
        
        return {
            exportDate: new Date().toISOString(),
            settings: this.settings,
            statistics: stats,
            rawData: data
        };
    }
    
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.sessionKey);
        this.eventQueue = [];
        this.statsCache = null;
        
        console.log('🗑️ Alle Analytics-Daten gelöscht');
        return true;
    }
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// =========================================================================
// GLOBAL EXPORT
// =========================================================================

// Erstelle globale Instanz
let analyticsManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        analyticsManager = new AnalyticsManager();
        window.analyticsManager = analyticsManager;
    });
} else {
    analyticsManager = new AnalyticsManager();
    window.analyticsManager = analyticsManager;
}

// Cleanup beim Verlassen der Seite
window.addEventListener('beforeunload', () => {
    if (window.analyticsManager) {
        window.analyticsManager.endSession();
    }
});
