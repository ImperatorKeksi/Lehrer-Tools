/*
    ╔═══════════════════════════════════════════════════╗
    ║  ♿ ACCESSIBILITY CONTROLLER                      ║
    ║  WCAG 2.1 AA Compliance & Screen Reader Support  ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
*/

class AccessibilityController {
    constructor() {
        this.init();
    }

    init() {
        this.addSkipLink();
        this.setupKeyboardNavigation();
        this.setupARIALabels();
        this.setupFocusTrap();
        this.setupLandmarkRoles();
        this.setupLiveRegions();
        this.setupHighContrastToggle();
    }

    // ========================================
    // SKIP NAVIGATION LINK (deaktiviert - nicht benötigt)
    // ========================================
    addSkipLink() {
        return;
    }

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================
    setupKeyboardNavigation() {
        let isKeyboardNav = false;

        // Keyboard Navigation Detection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isKeyboardNav = true;
                document.body.classList.add('keyboard-nav-active');
            }
        });

        document.addEventListener('mousedown', () => {
            isKeyboardNav = false;
            document.body.classList.remove('keyboard-nav-active');
        });

        // ESC zum Schließen von Modals/Overlays
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Schließe alle offenen Modals/Overlays
                const modals = document.querySelectorAll('.modal.active, .overlay.active, .mobile-nav-overlay.active');
                modals.forEach(modal => {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                });

                // Body Scroll freigeben
                document.body.style.overflow = '';
            }
        });

        // Enter/Space auf Buttons
        document.querySelectorAll('[role="button"]').forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    // ========================================
    // ARIA LABELS
    // ========================================
    setupARIALabels() {
        // Header
        const headers = document.querySelectorAll('header');
        headers.forEach(header => {
            if (!header.getAttribute('role')) {
                header.setAttribute('role', 'banner');
            }
        });

        // Navigation
        const navs = document.querySelectorAll('nav, .nav-menu');
        navs.forEach((nav, index) => {
            if (!nav.getAttribute('role')) {
                nav.setAttribute('role', 'navigation');
            }
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', `Navigation ${index + 1}`);
            }
        });

        // Main Content
        const mains = document.querySelectorAll('main, .container');
        mains.forEach(main => {
            if (!main.getAttribute('role')) {
                main.setAttribute('role', 'main');
            }
        });

        // Footer
        const footers = document.querySelectorAll('footer');
        footers.forEach(footer => {
            if (!footer.getAttribute('role')) {
                footer.setAttribute('role', 'contentinfo');
            }
        });

        // Buttons ohne Label
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            const text = button.textContent.trim();
            if (!text) {
                button.setAttribute('aria-label', 'Button');
            }
        });

        // Links ohne Text
        document.querySelectorAll('a:not([aria-label])').forEach(link => {
            const text = link.textContent.trim();
            if (!text && !link.querySelector('img[alt]')) {
                link.setAttribute('aria-label', 'Link');
            }
        });

        // Bilder ohne Alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', 'Bild');
            console.warn('Image missing alt text:', img.src);
        });

        // Form Inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            if (!input.getAttribute('aria-label') && !input.id) {
                const label = input.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    const id = 'input-' + Math.random().toString(36).substr(2, 9);
                    input.id = id;
                    label.setAttribute('for', id);
                }
            }

            // Required Fields
            if (input.required && !input.getAttribute('aria-required')) {
                input.setAttribute('aria-required', 'true');
            }
        });
    }

    // ========================================
    // FOCUS TRAP (für Modals)
    // ========================================
    setupFocusTrap() {
        const modals = document.querySelectorAll('.modal, .overlay, [role="dialog"]');

        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;

                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        });
    }

    // ========================================
    // LANDMARK ROLES
    // ========================================
    setupLandmarkRoles() {
        const landmarks = [
            { selector: 'header', role: 'banner' },
            { selector: 'nav', role: 'navigation' },
            { selector: 'main', role: 'main' },
            { selector: 'aside', role: 'complementary' },
            { selector: 'footer', role: 'contentinfo' },
            { selector: 'form', role: 'form' },
            { selector: 'search', role: 'search' }
        ];

        landmarks.forEach(({ selector, role }) => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.getAttribute('role')) {
                    el.setAttribute('role', role);
                }
            });
        });
    }

    // ========================================
    // LIVE REGIONS
    // ========================================
    setupLiveRegions() {
        // Create global live region if not exists
        if (!document.querySelector('[aria-live]')) {
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.id = 'live-region';
            document.body.appendChild(liveRegion);
        }
    }

    // ========================================
    // ANNOUNCE MESSAGE (Screen Reader)
    // ========================================
    static announce(message, priority = 'polite') {
        let liveRegion = document.getElementById('live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }

        liveRegion.setAttribute('aria-live', priority);
        liveRegion.textContent = message;

        // Clear nach 1 Sekunde
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    // ========================================
    // HIGH CONTRAST TOGGLE
    // ========================================
    setupHighContrastToggle() {
        const savedContrast = localStorage.getItem('highContrast');
        if (savedContrast === 'true') {
            document.body.classList.add('high-contrast');
        }

        // Listener für System Preference
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        contrastQuery.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    // ========================================
    // TOGGLE HIGH CONTRAST
    // ========================================
    static toggleHighContrast() {
        const isHighContrast = document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', isHighContrast);
        
        AccessibilityController.announce(
            `Hoher Kontrast ${isHighContrast ? 'aktiviert' : 'deaktiviert'}`,
            'assertive'
        );
    }

    // ========================================
    // FORM VALIDATION ACCESSIBILITY
    // ========================================
    static setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                
                // Error Message hinzufügen
                let errorMsg = input.nextElementSibling;
                if (!errorMsg || !errorMsg.classList.contains('form-error')) {
                    errorMsg = document.createElement('span');
                    errorMsg.className = 'form-error';
                    errorMsg.setAttribute('role', 'alert');
                    input.parentNode.insertBefore(errorMsg, input.nextSibling);
                }

                errorMsg.textContent = input.validationMessage;
                input.setAttribute('aria-invalid', 'true');
                input.setAttribute('aria-describedby', 'error-' + input.id);
                errorMsg.id = 'error-' + input.id;

                AccessibilityController.announce(input.validationMessage, 'assertive');
            });

            input.addEventListener('input', () => {
                if (input.validity.valid) {
                    const errorMsg = input.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('form-error')) {
                        errorMsg.remove();
                    }
                    input.removeAttribute('aria-invalid');
                    input.removeAttribute('aria-describedby');
                }
            });
        });
    }

    // ========================================
    // HEADING STRUCTURE CHECK
    // ========================================
    static checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        const errors = [];

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName[1]);
            
            if (index === 0 && level !== 1) {
                errors.push(`First heading should be h1, found h${level}`);
            }

            if (level > previousLevel + 1) {
                errors.push(`Heading level skipped from h${previousLevel} to h${level}`);
            }

            previousLevel = level;
        });

        if (errors.length > 0) {
            console.warn('Heading structure issues:', errors);
        }

        return errors.length === 0;
    }
}

// ========================================
// AUTO-INIT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityController = new AccessibilityController();
    
    // Check heading structure in dev mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        AccessibilityController.checkHeadingStructure();
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityController;
}
