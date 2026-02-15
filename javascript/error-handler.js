/*
    ╔═══════════════════════════════════════════════════╗
    ║  ⚠️ ERROR HANDLER - Zentrale Fehlerverwaltung    ║
    ║  Globales Error Handling & User Notifications    ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
*/

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Maximale Anzahl gespeicherter Fehler
        this.setupGlobalHandlers();
        console.log('✅ ErrorHandler initialisiert');
    }

    // ========================================
    // GLOBALE ERROR HANDLER
    // ========================================
    setupGlobalHandlers() {
        // Fange unbehandelte JavaScript-Fehler ab
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Fange Promise-Rejections ab
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unbehandelte Promise Rejection',
                error: event.reason
            });
        });

        console.log('✅ Globale Error Handler registriert');
    }

    // ========================================
    // ERROR HANDLING
    // ========================================
    handleError(errorInfo) {
        const error = {
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Speichern
        this.errors.push(error);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift(); // Ältesten Fehler entfernen
        }

        // In Console loggen
        console.error('❌ Fehler aufgetreten:', error);

        // Optional: An Server senden (wenn Backend vorhanden)
        this.sendToServer(error);

        // User benachrichtigen (nur kritische Fehler)
        if (this.isCritical(error)) {
            this.showUserNotification(error);
        }
    }

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    isCritical(error) {
        // Definiere was als "kritisch" gilt
        const criticalKeywords = [
            'localstorage',
            'session',
            'auth',
            'login',
            'database'
        ];

        const message = error.message.toLowerCase();
        return criticalKeywords.some(keyword => message.includes(keyword));
    }

    showUserNotification(error) {
        // Erstelle User-freundliche Fehlermeldung
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-content">
                <h4>Ein Fehler ist aufgetreten</h4>
                <p>${this.getUserFriendlyMessage(error)}</p>
                <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">
                    OK
                </button>
            </div>
        `;

        // Styles inline für Unabhängigkeit
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            display: flex;
            gap: 15px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto-remove nach 10 Sekunden
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    getUserFriendlyMessage(error) {
        // Konvertiere technische Fehler in benutzerfreundliche Nachrichten
        const message = error.message.toLowerCase();

        if (message.includes('localstorage')) {
            return 'Deine Browserdaten konnten nicht geladen werden. Bitte prüfe deine Browser-Einstellungen.';
        }
        if (message.includes('network') || message.includes('fetch')) {
            return 'Netzwerkverbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung.';
        }
        if (message.includes('session') || message.includes('auth')) {
            return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.';
        }

        // Fallback: Generische Nachricht
        return 'Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.';
    }

    async sendToServer(error) {
        return;
    }

    // ========================================
    // PUBLIC API
    // ========================================
    log(message, context = {}) {
        this.handleError({
            type: 'manual',
            message,
            context
        });
    }

    getErrors() {
        return [...this.errors];
    }

    clearErrors() {
        this.errors = [];
        console.log('🗑️ Fehlerprotokoll gelöscht');
    }

    // ========================================
    // ERROR RECOVERY
    // ========================================
    tryRecover(action, fallback = null) {
        /**
         * Führe eine Aktion aus mit automatischem Fallback
         * @param {Function} action - Die auszuführende Aktion
         * @param {Function|any} fallback - Fallback-Wert oder Funktion
         * @returns {any} Ergebnis der Aktion oder Fallback
         */
        try {
            return action();
        } catch (error) {
            this.handleError({
                type: 'recovery',
                message: error.message,
                error
            });

            if (typeof fallback === 'function') {
                try {
                    return fallback();
                } catch (fallbackError) {
                    console.error('❌ Auch Fallback fehlgeschlagen:', fallbackError);
                    return null;
                }
            }

            return fallback;
        }
    }

    async tryRecoverAsync(action, fallback = null) {
        /**
         * Async-Version von tryRecover
         */
        try {
            return await action();
        } catch (error) {
            this.handleError({
                type: 'recovery-async',
                message: error.message,
                error
            });

            if (typeof fallback === 'function') {
                try {
                    return await fallback();
                } catch (fallbackError) {
                    console.error('❌ Auch Fallback fehlgeschlagen:', fallbackError);
                    return null;
                }
            }

            return fallback;
        }
    }
}

// ========================================
// GLOBALE INSTANZ
// ========================================
window.errorHandler = new ErrorHandler();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================
window.handleError = (message, context) => window.errorHandler.log(message, context);
window.tryRecover = (action, fallback) => window.errorHandler.tryRecover(action, fallback);
window.tryRecoverAsync = (action, fallback) => window.errorHandler.tryRecoverAsync(action, fallback);

// ========================================
// CSS ANIMATION
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .error-notification .error-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }

    .error-notification .error-content {
        flex: 1;
    }

    .error-notification h4 {
        margin: 0 0 8px 0;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .error-notification p {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        line-height: 1.4;
    }

    .error-notification .error-dismiss {
        background: white;
        color: #dc2626;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .error-notification .error-dismiss:hover {
        background: #f3f4f6;
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);
