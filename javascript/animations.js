/*
    ╔═══════════════════════════════════════════════════╗
    ║  ✨ ANIMATIONS CONTROLLER                         ║
    ║  JavaScript für Animationen & Microinteractions  ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
*/

class AnimationsController {
    constructor() {
        this.init();
    }

    init() {
        try {
            this.setupPageLoader();
        } catch (e) {
            console.error('Page Loader Error:', e);
        }
        
        try {
            this.setupSmoothScroll();
        } catch (e) {
            console.error('Smooth Scroll Error:', e);
        }
        
        try {
            this.setupIntersectionObserver();
        } catch (e) {
            console.error('Intersection Observer Error:', e);
        }
        
        try {
            this.setupTooltips();
        } catch (e) {
            console.error('Tooltips Error:', e);
        }
        
        try {
            this.setupRippleEffect();
        } catch (e) {
            console.error('Ripple Effect Error:', e);
        }
    }

    // ========================================
    // PAGE LOADER
    // ========================================
    setupPageLoader() {
        // Loader HTML hinzufügen falls nicht vorhanden
        if (!document.querySelector('.page-loader')) {
            const loader = document.createElement('div');
            loader.className = 'page-loader';
            loader.innerHTML = `
                <div class="loader-spinner"></div>
                <div class="loader-text">Laden...</div>
            `;
            document.body.insertBefore(loader, document.body.firstChild);
        }

        // Loader SOFORT ausblenden wenn DOM ready ist
        const hideLoader = () => {
            const loader = document.querySelector('.page-loader');
            if (loader) {
                loader.classList.add('hidden');
                // Fade-in Animation für Hauptinhalt
                document.body.classList.add('page-transition');
            }
        };

        if (document.readyState === 'complete') {
            // Seite bereits geladen
            hideLoader();
        } else {
            // Auf DOMContentLoaded warten (schneller als 'load')
            window.addEventListener('DOMContentLoaded', hideLoader);
            // Fallback auf 'load' Event
            window.addEventListener('load', hideLoader);
        }
        
        // Sicherheits-Timeout: Loader nach max. 2 Sekunden ausblenden
        setTimeout(hideLoader, 2000);
    }

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    setupSmoothScroll() {
        // Smooth scroll für Anchor-Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Header offset
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // URL aktualisieren
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ========================================
    // INTERSECTION OBSERVER (Scroll Animations)
    // ========================================
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.05, // Reduziert von 0.1 für bessere Erkennung
            rootMargin: '50px 0px -50px 0px' // Erhöhter Margin für frühere Trigger
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    // Sicherstellen dass Element sichtbar ist
                    entry.target.style.opacity = '1';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Beobachte alle Karten, Panels, etc.
        const elements = document.querySelectorAll('.card, .panel, .game-card, .tool-card, .hero-section');
        elements.forEach(el => {
            // NUR verstecken wenn Element NICHT bereits im Viewport ist
            const rect = el.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (!isInViewport) {
                el.style.opacity = '0';
                observer.observe(el);
            } else {
                // Element ist bereits sichtbar - sofort anzeigen
                el.style.opacity = '1';
                el.classList.add('fade-in-up');
            }
        });

        // Staggered Animation für Grid-Items
        const gridContainers = document.querySelectorAll('.game-grid, .tools-grid, .features-grid');
        gridContainers.forEach(container => {
            const items = container.children;
            Array.from(items).forEach((item, index) => {
                item.classList.add('stagger-item');
                item.style.animationDelay = `${index * 0.1}s`;
            });
        });
    }

    // ========================================
    // TOOLTIPS
    // ========================================
    setupTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.classList.add('tooltip');
        });
    }

    // ========================================
    // RIPPLE EFFECT
    // ========================================
    setupRippleEffect() {
        document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .btn-success').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // CSS für Ripple dynamisch hinzufügen
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                .ripple-effect {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                }
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========================================
    // CONFETTI EFFECT
    // ========================================
    static createConfetti(x, y, count = 50) {
        const colors = ['#e0aaff', '#c77dff', '#9d4edd', '#7b2cbf', '#5a189a'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.3 + 's';
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // ========================================
    // SHAKE ELEMENT
    // ========================================
    static shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    // ========================================
    // BOUNCE ELEMENT
    // ========================================
    static bounce(element) {
        element.classList.add('bounce');
        setTimeout(() => element.classList.remove('bounce'), 1000);
    }

    // ========================================
    // GLOW ELEMENT
    // ========================================
    static glow(element, duration = 2000) {
        element.classList.add('glow');
        setTimeout(() => element.classList.remove('glow'), duration);
    }

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Notification Container erstellen falls nicht vorhanden
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }

        // Notification Style
        notification.style.cssText = `
            padding: 15px 20px;
            background: rgba(26, 26, 26, 0.95);
            border: 1px solid rgba(199, 125, 255, 0.3);
            border-radius: 10px;
            color: #e0aaff;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            min-width: 250px;
            animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        // Type-spezifische Farben
        if (type === 'success') {
            notification.style.borderColor = 'rgba(56, 239, 125, 0.5)';
            notification.style.color = '#38ef7d';
        } else if (type === 'error') {
            notification.style.borderColor = 'rgba(255, 107, 107, 0.5)';
            notification.style.color = '#ff6b6b';
        } else if (type === 'warning') {
            notification.style.borderColor = 'rgba(255, 165, 0, 0.5)';
            notification.style.color = '#ffa500';
        }

        container.appendChild(notification);

        // Auto-remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-in';
            setTimeout(() => notification.remove(), 400);
        }, duration);
    }

    // ========================================
    // HAPTIC FEEDBACK (Mobile)
    // ========================================
    static hapticFeedback(type = 'light') {
        if ('vibrate' in navigator) {
            switch(type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(50);
                    break;
                case 'success':
                    navigator.vibrate([10, 50, 10]);
                    break;
                case 'error':
                    navigator.vibrate([50, 100, 50]);
                    break;
            }
        }
    }
}

// ========================================
// AUTO-INIT
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.animationsController = new AnimationsController();
    });
} else {
    // DOM already loaded
    window.animationsController = new AnimationsController();
}

// Slideout animation für Notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(notificationStyle);

// Export für externe Nutzung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationsController;
}
