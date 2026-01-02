/*
    ╔═══════════════════════════════════════════════════╗
    ║  📱 RESPONSIVE CONTROLLER                         ║
    ║  Hamburger Menu & Mobile Navigation              ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

class ResponsiveController {
    constructor() {
        this.init();
    }

    init() {
        this.setupHamburgerMenu();
        this.setupViewportMeta();
        this.setupTouchOptimizations();
        this.setupOrientationChange();
    }

    // ========================================
    // HAMBURGER MENU SETUP
    // ========================================
    setupHamburgerMenu() {
        // Hamburger Button erstellen
        const headers = document.querySelectorAll('header, .main-header, .game-header, .timer-header');
        
        headers.forEach(header => {
            // Prüfen ob schon vorhanden
            if (header.querySelector('.mobile-menu-toggle')) return;

            // Hamburger Button
            const toggle = document.createElement('button');
            toggle.className = 'mobile-menu-toggle';
            toggle.setAttribute('aria-label', 'Navigation öffnen');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;

            // Mobile Overlay erstellen
            const overlay = document.createElement('div');
            overlay.className = 'mobile-nav-overlay';
            overlay.setAttribute('aria-hidden', 'true');

            // Navigation Items sammeln
            const navMenu = header.querySelector('.nav-menu, nav ul');
            const authButtons = header.querySelector('.nav-auth');
            
            if (navMenu) {
                const mobileMenu = document.createElement('ul');
                mobileMenu.className = 'mobile-nav-menu';

                // Nav Items kopieren
                const navItems = navMenu.querySelectorAll('li');
                navItems.forEach(item => {
                    const clone = item.cloneNode(true);
                    mobileMenu.appendChild(clone);
                });

                // Auth Buttons hinzufügen
                if (authButtons) {
                    const authClone = authButtons.cloneNode(true);
                    authClone.style.cssText = `
                        display: flex;
                        gap: 10px;
                        margin-top: 30px;
                        padding-top: 30px;
                        border-top: 1px solid rgba(199, 125, 255, 0.3);
                        justify-content: center;
                    `;
                    overlay.appendChild(authClone);
                }

                overlay.appendChild(mobileMenu);
            }

            // Toggle Button Event
            toggle.addEventListener('click', () => {
                const isActive = toggle.classList.contains('active');
                
                if (isActive) {
                    this.closeMobileMenu(toggle, overlay);
                } else {
                    this.openMobileMenu(toggle, overlay);
                }
            });

            // Overlay Klick zum Schließen
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeMobileMenu(toggle, overlay);
                }
            });

            // Links im Overlay schließen Menu
            overlay.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu(toggle, overlay);
                });
            });

            // ESC Key zum Schließen
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && toggle.classList.contains('active')) {
                    this.closeMobileMenu(toggle, overlay);
                }
            });

            // Button und Overlay einfügen
            const headerTitle = header.querySelector('.nav-brand, .header-title, h1');
            if (headerTitle) {
                headerTitle.parentNode.insertBefore(toggle, headerTitle.nextSibling);
            } else {
                header.appendChild(toggle);
            }
            
            document.body.appendChild(overlay);
        });
    }

    openMobileMenu(toggle, overlay) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Navigation schließen');
        
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        
        // Body Scroll sperren
        document.body.style.overflow = 'hidden';

        // Focus Management
        const firstLink = overlay.querySelector('a, button');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    }

    closeMobileMenu(toggle, overlay) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Navigation öffnen');
        
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        
        // Body Scroll freigeben
        document.body.style.overflow = '';

        // Focus zurück auf Toggle
        toggle.focus();
    }

    // ========================================
    // VIEWPORT META SETUP
    // ========================================
    setupViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }

        // Optimale Viewport Settings
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }

    // ========================================
    // TOUCH OPTIMIZATIONS
    // ========================================
    setupTouchOptimizations() {
        // Touch Delay entfernen (300ms)
        document.addEventListener('touchstart', function() {}, {passive: true});

        // Touch Feedback für Buttons
        const interactiveElements = document.querySelectorAll('button, .btn, a, input, textarea, select');
        
        interactiveElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            }, {passive: true});

            el.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.opacity = '';
                }, 150);
            }, {passive: true});
        });

        // Prevent Double-Tap Zoom auf Buttons
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                const target = e.target;
                if (target.matches('button, .btn, input[type="button"], input[type="submit"]')) {
                    e.preventDefault();
                }
            }
            lastTouchEnd = now;
        }, false);
    }

    // ========================================
    // ORIENTATION CHANGE
    // ========================================
    setupOrientationChange() {
        let currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

        window.addEventListener('resize', () => {
            const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
            
            if (newOrientation !== currentOrientation) {
                currentOrientation = newOrientation;
                
                // Event dispatchen
                const event = new CustomEvent('orientationchange', {
                    detail: { orientation: currentOrientation }
                });
                window.dispatchEvent(event);

                // Optional: Notification
                if (typeof AnimationsController !== 'undefined') {
                    AnimationsController.showNotification(
                        `Ausrichtung geändert: ${currentOrientation === 'landscape' ? '🌄 Querformat' : '📱 Hochformat'}`,
                        'info',
                        2000
                    );
                }
            }
        });
    }

    // ========================================
    // VIEWPORT SIZE DETECTION
    // ========================================
    static getViewportSize() {
        const width = window.innerWidth;
        
        if (width < 375) return 'mobile-s';
        if (width < 425) return 'mobile-m';
        if (width < 768) return 'mobile-l';
        if (width < 1024) return 'tablet';
        if (width < 1440) return 'laptop';
        if (width < 2560) return 'laptop-l';
        return 'desktop';
    }

    // ========================================
    // IS MOBILE CHECK
    // ========================================
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    static isDesktop() {
        return window.innerWidth > 1024;
    }

    // ========================================
    // TOUCH DEVICE CHECK
    // ========================================
    static isTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }

    // ========================================
    // PWA INSTALL CHECK (Mobile)
    // ========================================
    static isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    // ========================================
    // SAFE AREA INSETS (Notch Support)
    // ========================================
    static applySafeAreaInsets() {
        const root = document.documentElement;
        
        if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
            root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
            root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
            root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
            root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
        }
    }
}

// ========================================
// AUTO-INIT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveController = new ResponsiveController();
    ResponsiveController.applySafeAreaInsets();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveController;
}
