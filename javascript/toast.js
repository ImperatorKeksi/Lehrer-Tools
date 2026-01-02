/**
 * 🍞 TOAST NOTIFICATION SYSTEM
 * Lightweight, accessible toast notifications
 * 
 * Features:
 * - Success, Error, Warning, Info types
 * - Auto-dismiss with configurable duration
 * - Stacking multiple toasts
 * - Pause on hover
 * - ARIA live region for screen readers
 * - Smooth animations
 */

// Ensure debugLog exists
window.debugLog = window.debugLog || function() {};

class ToastNotification {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 5;
        this.defaultDuration = 4000;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.addStyles();
        
        // Global toast function
        window.showToast = this.show.bind(this);
        
        window.debugLog('🍞 Toast Notification System initialized');
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Notifications');
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }
            
            .toast {
                background: white;
                color: #333;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 500px;
                pointer-events: auto;
                animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                transition: transform 0.2s, opacity 0.2s;
            }
            
            .toast:hover {
                transform: translateX(-5px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
            
            .toast.removing {
                animation: slideOutRight 0.3s ease-in forwards;
            }
            
            .toast-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .toast-content {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .toast-message {
                opacity: 0.8;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background 0.2s;
            }
            
            .toast-close:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            /* Toast Types */
            .toast.success {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .toast.success .toast-close {
                color: white;
            }
            
            .toast.error {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
            }
            
            .toast.error .toast-close {
                color: white;
            }
            
            .toast.warning {
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                color: #333;
            }
            
            .toast.info {
                background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
                color: #333;
            }
            
            /* Progress Bar */
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.7);
                animation: shrink linear;
            }
            
            .toast.success .toast-progress {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .toast.error .toast-progress {
                background: rgba(255, 255, 255, 0.5);
            }
            
            /* Animations */
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            @keyframes shrink {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }
            
            /* Mobile Responsive */
            @media (max-width: 640px) {
                #toast-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }
                
                .toast {
                    min-width: auto;
                    max-width: 100%;
                }
            }
            
            /* Dark Mode */
            [data-theme="dark"] .toast {
                background: #2a2a2a;
                color: #e0e0e0;
            }
            
            [data-theme="dark"] .toast-close {
                color: #aaa;
            }
        `;
        document.head.appendChild(style);
    }
    
    show(options) {
        // Handle string shorthand
        if (typeof options === 'string') {
            options = { message: options };
        }
        
        const {
            message = '',
            title = '',
            type = 'info', // success, error, warning, info
            duration = this.defaultDuration,
            icon = this.getDefaultIcon(type)
        } = options;
        
        // Limit number of toasts
        if (this.toasts.length >= this.maxToasts) {
            this.remove(this.toasts[0]);
        }
        
        const toast = this.createToast({ message, title, type, icon, duration });
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // Auto dismiss
        if (duration > 0) {
            const timeoutId = setTimeout(() => {
                this.remove(toast);
            }, duration);
            
            // Pause on hover
            toast.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
                const progress = toast.querySelector('.toast-progress');
                if (progress) {
                    progress.style.animationPlayState = 'paused';
                }
            });
            
            toast.addEventListener('mouseleave', () => {
                const remainingTime = duration * 0.3; // 30% remaining
                setTimeout(() => {
                    this.remove(toast);
                }, remainingTime);
            });
        }
        
        return toast;
    }
    
    createToast({ message, title, type, icon, duration }) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
            ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
        `;
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });
        
        return toast;
    }
    
    remove(toast) {
        if (!toast || !this.toasts.includes(toast)) return;
        
        toast.classList.add('removing');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }
    
    getDefaultIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    // Convenience methods
    success(message, title = '') {
        return this.show({ message, title, type: 'success' });
    }
    
    error(message, title = '') {
        return this.show({ message, title, type: 'error' });
    }
    
    warning(message, title = '') {
        return this.show({ message, title, type: 'warning' });
    }
    
    info(message, title = '') {
        return this.show({ message, title, type: 'info' });
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.toastNotification = new ToastNotification();
    });
} else {
    window.toastNotification = new ToastNotification();
}

// Convenience global functions
window.toast = {
    success: (msg, title) => window.toastNotification?.success(msg, title),
    error: (msg, title) => window.toastNotification?.error(msg, title),
    warning: (msg, title) => window.toastNotification?.warning(msg, title),
    info: (msg, title) => window.toastNotification?.info(msg, title),
    show: (options) => window.toastNotification?.show(options)
};
