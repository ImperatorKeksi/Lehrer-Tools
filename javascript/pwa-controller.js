/*
    ╔═══════════════════════════════════════════════════╗
    ║  📱 PWA CONTROLLER                                ║
    ║  Install Prompt, Push Notifications, Offline     ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

class PWAController {
    constructor() {
        this.deferredPrompt = null;
        this.registration = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupPushNotifications();
        this.checkOnlineStatus();
        this.setupUpdateCheck();
    }

    // ========================================
    // SERVICE WORKER REGISTRATION
    // ========================================
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('../pwa/sw.js', {
                    scope: '../'
                });

                console.log('✅ Service Worker registered:', this.registration.scope);

                // Update Check
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Message Handler
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data && event.data.type === 'CACHE_UPDATED') {
                        console.log('🔄 Cache updated');
                    }
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // ========================================
    // INSTALL PROMPT (Add to Home Screen)
    // ========================================
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Install Button anzeigen
            this.showInstallButton();
        });

        // Nach erfolgreicher Installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installiert!');
            this.deferredPrompt = null;
            
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification(
                    '🎉 App erfolgreich installiert!',
                    'success',
                    3000
                );
            }

            // Analytics
            this.trackEvent('pwa_installed');
        });
    }

    showInstallButton() {
        // Prüfe ob bereits installiert
        if (this.isPWAInstalled()) return;

        // Installier-Button Container erstellen
        let installBanner = document.getElementById('install-banner');
        
        if (!installBanner) {
            installBanner = document.createElement('div');
            installBanner.id = 'install-banner';
            installBanner.className = 'install-banner';
            installBanner.innerHTML = `
                <div class="install-banner-content">
                    <span class="install-icon">📱</span>
                    <div class="install-text">
                        <strong>Als App installieren</strong>
                        <small>Schneller Zugriff auf alle Tools</small>
                    </div>
                    <button class="btn btn-primary" id="install-btn">Installieren</button>
                    <button class="btn-close" id="install-close" aria-label="Schließen">×</button>
                </div>
            `;

            // Style für Banner
            const style = document.createElement('style');
            style.textContent = `
                .install-banner {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(26, 26, 26, 0.98);
                    border: 2px solid #9d4edd;
                    border-radius: 16px;
                    padding: 16px 20px;
                    box-shadow: 0 10px 40px rgba(157, 77, 221, 0.3);
                    z-index: 10000;
                    max-width: 90%;
                    animation: slideInUp 0.5s ease-out;
                }
                .install-banner-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .install-icon {
                    font-size: 2rem;
                }
                .install-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .install-text strong {
                    color: #e0aaff;
                    font-size: 1.1rem;
                }
                .install-text small {
                    color: #c77dff;
                    font-size: 0.9rem;
                }
                .btn-close {
                    background: none;
                    border: none;
                    color: #c77dff;
                    font-size: 1.8rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .btn-close:hover {
                    color: #e0aaff;
                    transform: rotate(90deg);
                }
                @media (max-width: 768px) {
                    .install-banner {
                        bottom: 10px;
                        left: 10px;
                        right: 10px;
                        transform: none;
                        max-width: none;
                    }
                    .install-banner-content {
                        flex-wrap: wrap;
                    }
                    .install-text {
                        flex: 1 1 100%;
                        order: -1;
                    }
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(installBanner);

            // Install Button Click
            document.getElementById('install-btn').addEventListener('click', () => {
                this.promptInstall();
            });

            // Close Button
            document.getElementById('install-close').addEventListener('click', () => {
                installBanner.remove();
                localStorage.setItem('installBannerDismissed', Date.now());
            });

            // Auto-hide nach 30 Sekunden
            setTimeout(() => {
                if (installBanner.parentNode) {
                    installBanner.style.animation = 'slideOutDown 0.5s ease-in';
                    setTimeout(() => installBanner.remove(), 500);
                }
            }, 30000);
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('⚠️ Install prompt not available');
            return;
        }

        this.deferredPrompt.prompt();

        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        this.trackEvent('install_prompt', { outcome });

        this.deferredPrompt = null;
        document.getElementById('install-banner')?.remove();
    }

    isPWAInstalled() {
        // Check if running as PWA
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    }

    // ========================================
    // PUSH NOTIFICATIONS
    // ========================================
    async setupPushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.log('⚠️ Push notifications not supported');
            return;
        }

        // Check permission
        if (Notification.permission === 'default') {
            // Warte auf User-Interaktion
            this.showNotificationPrompt();
        }
    }

    showNotificationPrompt() {
        // Nur anzeigen wenn sinnvoll (z.B. bei Timer)
        const isTimerPage = window.location.pathname.includes('timer');
        if (!isTimerPage) return;

        setTimeout(() => {
            if (typeof AnimationsController !== 'undefined') {
                const banner = document.createElement('div');
                banner.style.cssText = `
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: rgba(26, 26, 26, 0.95);
                    border: 1px solid #9d4edd;
                    border-radius: 12px;
                    padding: 16px;
                    max-width: 300px;
                    z-index: 10000;
                    animation: slideInRight 0.4s ease-out;
                `;
                banner.innerHTML = `
                    <div style="color: #e0aaff; margin-bottom: 10px;">
                        🔔 <strong>Benachrichtigungen</strong>
                    </div>
                    <div style="color: #c77dff; font-size: 0.9rem; margin-bottom: 15px;">
                        Erhalte Benachrichtigungen wenn der Timer abläuft
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" style="flex: 1;" id="enable-notifications">Aktivieren</button>
                        <button class="btn" style="flex: 1;" id="dismiss-notifications">Später</button>
                    </div>
                `;

                document.body.appendChild(banner);

                document.getElementById('enable-notifications').addEventListener('click', async () => {
                    await this.requestNotificationPermission();
                    banner.remove();
                });

                document.getElementById('dismiss-notifications').addEventListener('click', () => {
                    banner.remove();
                });

                setTimeout(() => banner.remove(), 15000);
            }
        }, 3000);
    }

    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                
                if (typeof AnimationsController !== 'undefined') {
                    AnimationsController.showNotification(
                        '✅ Benachrichtigungen aktiviert!',
                        'success',
                        3000
                    );
                }

                // Subscribe to push
                await this.subscribeToPush();
            } else {
                console.log('⚠️ Notification permission denied');
            }

            this.trackEvent('notification_permission', { permission });
        } catch (error) {
            console.error('❌ Notification error:', error);
        }
    }

    async subscribeToPush() {
        if (!this.registration) return;

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_PUBLIC_VAPID_KEY_HERE' // TODO: Replace with actual VAPID key
                )
            });

            console.log('✅ Push subscription:', subscription);
            
            // Send subscription to server
            // await fetch('/api/push/subscribe', {
            //     method: 'POST',
            //     body: JSON.stringify(subscription),
            //     headers: { 'Content-Type': 'application/json' }
            // });

        } catch (error) {
            console.error('❌ Push subscription failed:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // ========================================
    // TIMER NOTIFICATIONS
    // ========================================
    static async sendTimerNotification(title, body) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'TIMER_NOTIFICATION',
                title: title,
                body: body
            });
        } else if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '../icons/logo-simple.svg',
                vibrate: [300, 100, 300, 100, 300],
                requireInteraction: true
            });
        }
    }

    // ========================================
    // ONLINE/OFFLINE STATUS
    // ========================================
    checkOnlineStatus() {
        window.addEventListener('online', () => {
            console.log('🌐 Online');
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification('🌐 Verbindung wiederhergestellt', 'success', 2000);
            }
            this.syncWhenOnline();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Offline');
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification('📴 Offline-Modus aktiv', 'warning', 3000);
            }
        });
    }

    async syncWhenOnline() {
        if ('sync' in self.registration) {
            try {
                await self.registration.sync.register('background-sync-stats');
                console.log('🔄 Background sync registered');
            } catch (error) {
                console.error('❌ Sync registration failed:', error);
            }
        }
    }

    // ========================================
    // UPDATE CHECK
    // ========================================
    setupUpdateCheck() {
        // Check für Updates alle 60 Minuten
        setInterval(async () => {
            if (this.registration) {
                await this.registration.update();
            }
        }, 60 * 60 * 1000);
    }

    showUpdateNotification() {
        if (typeof AnimationsController !== 'undefined') {
            const updateBanner = document.createElement('div');
            updateBanner.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(26, 26, 26, 0.98);
                border: 2px solid #38ef7d;
                border-radius: 12px;
                padding: 16px 24px;
                z-index: 10001;
                box-shadow: 0 10px 40px rgba(56, 239, 125, 0.3);
                animation: slideInDown 0.5s ease-out;
            `;
            updateBanner.innerHTML = `
                <div style="color: #38ef7d; margin-bottom: 10px;">
                    🔄 <strong>Update verfügbar!</strong>
                </div>
                <div style="color: #e0aaff; margin-bottom: 15px; font-size: 0.95rem;">
                    Eine neue Version der App ist verfügbar
                </div>
                <button class="btn btn-success" id="update-btn">Jetzt aktualisieren</button>
            `;

            document.body.appendChild(updateBanner);

            document.getElementById('update-btn').addEventListener('click', () => {
                if (this.registration && this.registration.waiting) {
                    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                window.location.reload();
            });
        }
    }

    // ========================================
    // ANALYTICS
    // ========================================
    trackEvent(eventName, data = {}) {
        console.log('📊 Event:', eventName, data);
        // TODO: Send to analytics service
    }
}

// ========================================
// AUTO-INIT
// ========================================
let pwaController;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pwaController = new PWAController();
        window.pwaController = pwaController;
    });
} else {
    pwaController = new PWAController();
    window.pwaController = pwaController;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAController;
}
