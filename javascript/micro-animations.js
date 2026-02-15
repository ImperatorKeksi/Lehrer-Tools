/**
 * ✨ MICRO-ANIMATIONS & SMOOTH TRANSITIONS
 * Subtle animations that enhance UX
 * 
 * Features:
 * - Hover effects
 * - Click feedback
 * - Entrance animations
 * - Smooth scrolling
 * - Page transitions
 */

// Ensure debugLog exists
window.debugLog = window.debugLog || function() {};

class MicroAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.addStyles();
        this.enhanceButtons();
        this.enhanceCards();
        this.setupSmoothScrolling();
        this.setupPageTransitions();
        this.setupHoverEffects();
        
        window.debugLog('✨ Micro-Animations initialized');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Smooth All Transitions */
            * {
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Button Micro-Animations */
            .btn, button:not(.toast-close) {
                transition: transform 0.1s, box-shadow 0.2s, background 0.2s;
                transform-origin: center;
            }
            
            .btn:hover:not(:disabled), button:hover:not(:disabled):not(.toast-close) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .btn:active:not(:disabled), button:active:not(:disabled):not(.toast-close) {
                transform: translateY(0) scale(0.98);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            /* Card Hover Effects */
            .question-card, .tool-card, .game-card {
                transition: transform 0.3s, box-shadow 0.3s;
                cursor: pointer;
            }
            
            .question-card:hover, .tool-card:hover, .game-card:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            }
            
            .question-card:active {
                transform: translateY(-3px) scale(1.01);
            }
            
            /* Ripple Effect */
            .ripple {
                position: relative;
                overflow: hidden;
            }
            
            .ripple::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            
            .ripple:active::after {
                width: 300px;
                height: 300px;
            }
            
            /* Entrance Animations */
            .fade-in {
                animation: fadeInUp 0.5s ease-out;
            }
            
            .slide-in-left {
                animation: slideInLeft 0.5s ease-out;
            }
            
            .slide-in-right {
                animation: slideInRight 0.5s ease-out;
            }
            
            .scale-in {
                animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Pulse Animation */
            .pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            /* Shake Animation (for errors) */
            .shake {
                animation: shake 0.5s;
            }
            
            @keyframes shake {
                0%, 100% {
                    transform: translateX(0);
                }
                10%, 30%, 50%, 70%, 90% {
                    transform: translateX(-10px);
                }
                20%, 40%, 60%, 80% {
                    transform: translateX(10px);
                }
            }
            
            /* Glow Effect */
            .glow {
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
                animation: glowPulse 2s infinite;
            }
            
            @keyframes glowPulse {
                0%, 100% {
                    box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
                }
                50% {
                    box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
                }
            }
            
            /* Smooth Scroll */
            html {
                scroll-behavior: smooth;
            }
            
            /* Page Transition */
            .page-transition {
                animation: pageTransition 0.3s ease-in-out;
            }
            
            @keyframes pageTransition {
                0% {
                    opacity: 0;
                    transform: scale(0.95);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Loading Skeleton Shimmer */
            .shimmer {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            /* Bounce */
            .bounce {
                animation: bounce 1s infinite;
            }
            
            @keyframes bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }
            
            /* Rotate */
            .rotate {
                animation: rotate 2s linear infinite;
            }
            
            @keyframes rotate {
                to {
                    transform: rotate(360deg);
                }
            }
            
            /* Fade */
            .fade-out {
                animation: fadeOut 0.5s forwards;
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                }
            }
            
            /* Reduce Motion for Accessibility */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================
    // ENHANCE BUTTONS
    // ========================================
    enhanceButtons() {
        document.querySelectorAll('.btn, button').forEach(btn => {
            if (!btn.classList.contains('ripple')) {
                btn.classList.add('ripple');
            }
        });
    }
    
    // ========================================
    // ENHANCE CARDS
    // ========================================
    enhanceCards() {
        // Add entrance animations to cards
        const cards = document.querySelectorAll('.question-card, .tool-card, .game-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 50); // Stagger animation
        });
    }
    
    // ========================================
    // SMOOTH SCROLLING
    // ========================================
    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // ========================================
    // PAGE TRANSITIONS
    // ========================================
    setupPageTransitions() {
        // Add transition to main content on page load
        const mainContent = document.querySelector('main, .container, #app');
        if (mainContent) {
            mainContent.classList.add('page-transition');
        }
    }
    
    // ========================================
    // HOVER EFFECTS
    // ========================================
    setupHoverEffects() {
        // Add magnetic effect to buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    pulse(element) {
        element.classList.add('pulse');
    }
    
    glow(element) {
        element.classList.add('glow');
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.microAnimations = new MicroAnimations();
    });
} else {
    window.microAnimations = new MicroAnimations();
}

// Global animation utilities
window.animateElement = {
    shake: (el) => window.microAnimations?.shake(el),
    pulse: (el) => window.microAnimations?.pulse(el),
    glow: (el) => window.microAnimations?.glow(el)
};
