/*
    ╔═══════════════════════════════════════════════════╗
    ║  📳 HAPTIC & FEEDBACK CONTROLLER                  ║
    ║  Haptic Feedback, Vibration, Enhanced UX        ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

class HapticFeedbackController {
    constructor() {
        this.enabled = true;
        this.vibrationSupported = 'vibrate' in navigator;
        this.init();
    }

    init() {
        // Load settings
        const saved = localStorage.getItem('haptic-enabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }

        // Auto-disable on desktop (unless explicitly enabled)
        if (!this.isMobileDevice() && saved === null) {
            this.enabled = false;
        }

        console.log(`📳 Haptic Feedback: ${this.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`📳 Vibration API: ${this.vibrationSupported ? 'Supported' : 'Not Supported'}`);
    }

    // ========================================
    // HAPTIC PATTERNS
    // ========================================
    vibrate(pattern) {
        if (!this.enabled || !this.vibrationSupported) return;

        try {
            if (typeof pattern === 'number') {
                navigator.vibrate(pattern);
            } else if (Array.isArray(pattern)) {
                navigator.vibrate(pattern);
            }
        } catch (error) {
            console.error('❌ Vibration error:', error);
        }
    }

    // Predefined patterns
    light() {
        this.vibrate(10);
    }

    medium() {
        this.vibrate(25);
    }

    strong() {
        this.vibrate(50);
    }

    double() {
        this.vibrate([25, 50, 25]);
    }

    triple() {
        this.vibrate([20, 30, 20, 30, 20]);
    }

    success() {
        this.vibrate([30, 50, 30]);
    }

    error() {
        this.vibrate([50, 100, 50, 100, 50]);
    }

    warning() {
        this.vibrate([40, 80, 40]);
    }

    notification() {
        this.vibrate([20, 100, 20]);
    }

    // Special patterns
    heartbeat() {
        this.vibrate([50, 50, 50, 200, 50, 50, 50]);
    }

    sos() {
        // S: ... O: --- S: ...
        this.vibrate([50,50,50,50,50,200,150,50,150,50,150,200,50,50,50,50,50]);
    }

    // ========================================
    // CONTEXT-SPECIFIC FEEDBACK
    // ========================================
    buttonClick() {
        this.light();
        if (window.soundManager && window.soundManager.enabled) {
            window.soundManager.play('click');
        }
    }

    buttonPress() {
        this.medium();
    }

    buttonRelease() {
        this.light();
    }

    selectionChanged() {
        this.light();
    }

    toggleSwitch(on) {
        if (on) {
            this.vibrate([20, 30, 40]);
        } else {
            this.vibrate([40, 30, 20]);
        }
    }

    slider() {
        this.vibrate(5);
    }

    correctAnswer() {
        this.success();
        if (window.soundManager) {
            window.soundManager.play('correct');
        }
        // Confetti Animation
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.createConfetti();
        }
    }

    wrongAnswer() {
        this.error();
        if (window.soundManager) {
            window.soundManager.play('wrong');
        }
        // Shake Animation
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.shake(document.body);
        }
    }

    gameWin() {
        this.vibrate([50, 100, 50, 100, 50, 100, 200]);
        if (window.soundManager) {
            window.soundManager.play('victory');
        }
        // Confetti Animation
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.createConfetti(100);
        }
    }

    gameLose() {
        this.vibrate([100, 50, 100, 50, 100]);
        if (window.soundManager) {
            window.soundManager.play('defeat');
        }
    }

    timerAlert() {
        this.vibrate([200, 100, 200, 100, 200]);
        if (window.soundManager) {
            window.soundManager.play('alarm');
        }
    }

    // ========================================
    // SETTINGS
    // ========================================
    enable() {
        this.enabled = true;
        localStorage.setItem('haptic-enabled', 'true');
        this.medium(); // Feedback that it's enabled
        
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification('📳 Haptic Feedback aktiviert', 'success', 2000);
        }
    }

    disable() {
        this.enabled = false;
        localStorage.setItem('haptic-enabled', 'false');
        
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification('📳 Haptic Feedback deaktiviert', 'info', 2000);
        }
    }

    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }

    // ========================================
    // DEVICE DETECTION
    // ========================================
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // ========================================
    // SETTINGS UI
    // ========================================
    createSettingsToggle() {
        if (document.getElementById('haptic-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'haptic-toggle';
        toggle.className = 'haptic-toggle-btn';
        toggle.innerHTML = `
            <span class="haptic-icon">📳</span>
            <span class="haptic-status">${this.enabled ? 'AN' : 'AUS'}</span>
        `;
        toggle.title = 'Haptic Feedback umschalten';
        toggle.setAttribute('aria-label', 'Haptic Feedback umschalten');

        toggle.addEventListener('click', () => {
            const newState = this.toggle();
            toggle.querySelector('.haptic-status').textContent = newState ? 'AN' : 'AUS';
            toggle.classList.toggle('active', newState);
        });

        if (this.enabled) {
            toggle.classList.add('active');
        }

        // Style
        const style = document.createElement('style');
        style.textContent = `
            .haptic-toggle-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--glass-bg, rgba(26, 26, 26, 0.7));
                backdrop-filter: blur(10px);
                border: 2px solid var(--border-primary, rgba(157, 77, 221, 0.3));
                border-radius: 30px;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 9997;
                box-shadow: 0 4px 16px var(--shadow-primary, rgba(157, 77, 221, 0.3));
            }
            .haptic-toggle-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px var(--shadow-glow, rgba(157, 77, 221, 0.5));
            }
            .haptic-toggle-btn.active {
                border-color: var(--success, #38ef7d);
            }
            .haptic-icon {
                font-size: 1.3rem;
            }
            .haptic-status {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-secondary, #e0aaff);
            }
            .haptic-toggle-btn.active .haptic-status {
                color: var(--success, #38ef7d);
            }
            @media (max-width: 768px) {
                .haptic-toggle-btn {
                    bottom: 15px;
                    right: 15px;
                    padding: 10px 16px;
                }
            }
            @media print {
                .haptic-toggle-btn {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toggle);
    }
}

// ========================================
// ENHANCED SOUND MANAGER EXTENSION
// ========================================
class EnhancedSoundManager {
    constructor() {
        this.soundThemes = {
            default: {
                click: { type: 'beep', frequency: 800, duration: 50 },
                hover: { type: 'beep', frequency: 600, duration: 30 },
                success: { type: 'melody', notes: [523, 659, 784], duration: 100 },
                error: { type: 'beep', frequency: 200, duration: 200 }
            },
            retro: {
                click: { type: 'beep', frequency: 1200, duration: 40 },
                hover: { type: 'beep', frequency: 900, duration: 20 },
                success: { type: 'melody', notes: [400, 500, 600, 800], duration: 80 },
                error: { type: 'beep', frequency: 150, duration: 250 }
            },
            minimal: {
                click: { type: 'beep', frequency: 600, duration: 20 },
                hover: { type: 'none' },
                success: { type: 'beep', frequency: 800, duration: 100 },
                error: { type: 'beep', frequency: 300, duration: 150 }
            }
        };

        this.currentTheme = 'default';
    }

    setTheme(themeName) {
        if (this.soundThemes[themeName]) {
            this.currentTheme = themeName;
            localStorage.setItem('sound-theme', themeName);
            
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification(
                    `🔊 Sound-Theme: ${themeName}`,
                    'success',
                    2000
                );
            }
        }
    }

    playThemedSound(soundName) {
        const theme = this.soundThemes[this.currentTheme];
        const soundConfig = theme[soundName];
        
        if (!soundConfig || soundConfig.type === 'none') return;

        if (window.soundManager) {
            window.soundManager.play(soundName);
        }
    }
}

// ========================================
// AUTO-INIT
// ========================================
const hapticController = new HapticFeedbackController();
window.hapticController = hapticController;

const enhancedSoundManager = new EnhancedSoundManager();
window.enhancedSoundManager = enhancedSoundManager;

// Add haptic to all buttons automatically
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupGlobalHaptics();
    });
} else {
    setupGlobalHaptics();
}

function setupGlobalHaptics() {
    // Add haptic feedback to all buttons
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button, a, .btn, [role="button"]');
        if (button && !button.hasAttribute('data-no-haptic')) {
            hapticController.buttonClick();
        }
    }, true);

    // Haptic toggle button (nur auf mobilen Geräten anzeigen)
    if (hapticController.isMobileDevice()) {
        hapticController.createSettingsToggle();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HapticFeedbackController, EnhancedSoundManager };
}
