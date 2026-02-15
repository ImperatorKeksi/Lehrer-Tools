/**
 * 🎮 PRODUCTION CONFIGURATION
 * Zentrale Konfiguration für Production-Mode
 * 
 * WICHTIG: Setze DEBUG_MODE auf false für Production!
 */

window.PRODUCTION_CONFIG = {
    // 🔧 Debug-Einstellungen
    DEBUG_MODE: false,              // Hauptschalter: false = Production Mode
    VERBOSE_LOGGING: false,         // Detaillierte Logs
    SHOW_PERFORMANCE_METRICS: false, // Performance-Metriken anzeigen
    ENABLE_DEBUG_PANEL: false,      // Debug-Panel aktivieren
    
    // 📊 Feature Flags
    ENABLE_STATISTICS: true,        // Statistiken aktivieren
    ENABLE_PWA: true,               // Progressive Web App aktivieren
    ENABLE_ANIMATIONS: true,        // Animationen aktivieren
    ENABLE_SOUND: true,             // Sound aktivieren
    ENABLE_HAPTIC: true,            // Haptisches Feedback aktivieren
    
    // ⚡ Performance
    LAZY_LOAD_IMAGES: true,         // Bilder lazy loaden
    CACHE_ENABLED: true,            // Caching aktivieren
    PRELOAD_ASSETS: true,           // Assets vorladen
    
    // 🔐 Sicherheit
    ENCRYPT_LOCALSTORAGE: false,    // LocalStorage verschlüsseln
    ENABLE_SESSION_TIMEOUT: true,   // Session-Timeout aktivieren
    SESSION_TIMEOUT_MINUTES: 120,   // Session-Timeout in Minuten
    
    // 📱 PWA
    ENABLE_INSTALL_PROMPT: true,    // PWA Install-Prompt anzeigen
    ENABLE_PUSH_NOTIFICATIONS: false, // Push-Benachrichtigungen
    ENABLE_OFFLINE_MODE: true,      // Offline-Modus aktivieren
    
    // 🎨 UI
    ENABLE_THEME_TOGGLE: true,      // Theme-Wechsel aktivieren
    DEFAULT_THEME: 'auto',          // Standard-Theme: 'light', 'dark', 'auto'
    ENABLE_ACCESSIBILITY: true,     // Accessibility-Features aktivieren
    
    // 📈 Analytics
    ENABLE_ANALYTICS: false,        // Analytics deaktiviert (DSGVO)
    TRACK_PAGE_VIEWS: false,        // Page Views tracken
    TRACK_BUTTON_CLICKS: false,     // Button-Klicks tracken
    
    // 🚨 Error Handling
    SHOW_USER_ERRORS: true,         // Fehler dem User anzeigen
    LOG_ERRORS_TO_SERVER: false,    // Fehler an Server senden
    ENABLE_ERROR_RECOVERY: true,    // Automatische Fehler-Wiederherstellung
    
    // 🌐 API
    API_ENABLED: false,             // Backend-API aktivieren
    API_ENDPOINT: '',               // API-Endpunkt
    API_TIMEOUT: 10000,             // API-Timeout in ms
    
    // 📝 Console Logging
    LOG_LEVELS: {
        error: true,                // console.error() immer anzeigen
        warn: true,                 // console.warn() in Production
        info: false,                // console.info() nur im Debug-Mode
        log: false,                 // console.log() nur im Debug-Mode
        debug: false                // console.debug() nur im Debug-Mode
    }
};

/**
 * 🔧 Helper-Funktion: Conditional Logging
 * Nutze diese Funktion statt console.log() direkt
 */
window.debugLog = function(...args) {
    if (window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.DEBUG_MODE) {
        console.log(...args);
    }
};

window.debugInfo = function(...args) {
    if (window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.LOG_LEVELS?.info) {
        console.info(...args);
    }
};

window.debugWarn = function(...args) {
    if (window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.LOG_LEVELS?.warn) {
        console.warn(...args);
    }
};

window.debugError = function(...args) {
    if (window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.LOG_LEVELS?.error) {
        console.error(...args);
    }
};

// Export als Properties um sicherzustellen dass sie verfügbar sind
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'debugLog', {
        value: window.debugLog,
        writable: false,
        configurable: false
    });
}

// 📊 Zeige Config-Status beim Laden
if (window.PRODUCTION_CONFIG.DEBUG_MODE) {
    console.log('%c🎮 KEKSI GAME - DEBUG MODE ACTIVE', 'background: #ff6b6b; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('Production Config:', window.PRODUCTION_CONFIG);
} else {
    console.log('%c🎮 KEKSI GAME - PRODUCTION MODE', 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
}
