/**
 * ⏳ LOADING STATES SYSTEM
 * Beautiful loading indicators for async operations
 * 
 * Features:
 * - Skeleton loaders
 * - Spinner overlays
 * - Progress bars
 * - Shimmer effects
 * - Button loading states
 */

// Ensure debugLog exists
window.debugLog = window.debugLog || function() {};

class LoadingStates {
    constructor() {
        this.activeLoaders = new Map();
        this.init();
    }
    
    init() {
        this.addStyles();
        
        // Global loading functions
        window.showLoading = this.show.bind(this);
        window.hideLoading = this.hide.bind(this);
        window.setButtonLoading = this.setButtonLoading.bind(this);
        
        window.debugLog('⏳ Loading States System initialized');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Loading Overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease-in;
            }
            
            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: #667eea;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            
            .loading-content {
                text-align: center;
                color: white;
            }
            
            .loading-text {
                margin-top: 16px;
                font-size: 16px;
                font-weight: 500;
            }
            
            /* Spinner Animation */
            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            /* Button Loading State */
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.7;
            }
            
            .btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid white;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
            }
            
            .btn-loading .btn-text {
                visibility: hidden;
            }
            
            /* Skeleton Loader */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }
            
            [data-theme="dark"] .skeleton {
                background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
                background-size: 200% 100%;
            }
            
            @keyframes shimmer {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }
            
            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }
            
            .skeleton-text:last-child {
                width: 60%;
            }
            
            .skeleton-title {
                height: 24px;
                width: 40%;
                margin-bottom: 16px;
            }
            
            .skeleton-card {
                padding: 20px;
                background: white;
                border-radius: 8px;
            }
            
            [data-theme="dark"] .skeleton-card {
                background: #1a1a1a;
            }
            
            /* Progress Bar */
            .progress-bar-container {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 16px;
            }
            
            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s ease;
                border-radius: 4px;
            }
            
            /* Inline Loading */
            .inline-loader {
                display: inline-block;
                width: 14px;
                height: 14px;
                border: 2px solid currentColor;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
                vertical-align: middle;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================
    // OVERLAY LOADING
    // ========================================
    show(text = 'Loading...', id = 'default') {
        // Remove existing loader with same ID
        this.hide(id);
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.dataset.loaderId = id;
        
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${text}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.activeLoaders.set(id, overlay);
        
        return overlay;
    }
    
    hide(id = 'default') {
        const loader = this.activeLoaders.get(id);
        if (loader && loader.parentNode) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
                this.activeLoaders.delete(id);
            }, 200);
        }
    }
    
    // ========================================
    // BUTTON LOADING
    // ========================================
    setButtonLoading(button, loading = true) {
        if (!button) return;
        
        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            
            // Wrap text content
            if (!button.querySelector('.btn-text')) {
                const text = button.textContent;
                button.innerHTML = `<span class="btn-text">${text}</span>`;
            }
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }
    
    // ========================================
    // SKELETON LOADER
    // ========================================
    createSkeleton(type = 'text', count = 3) {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        
        if (type === 'text') {
            for (let i = 0; i < count; i++) {
                const skeleton = document.createElement('div');
                skeleton.className = 'skeleton skeleton-text';
                container.appendChild(skeleton);
            }
        } else if (type === 'card') {
            container.className = 'skeleton-card';
            container.innerHTML = `
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `;
        }
        
        return container;
    }
    
    // ========================================
    // PROGRESS BAR
    // ========================================
    createProgressBar(progress = 0) {
        const container = document.createElement('div');
        container.className = 'progress-bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.width = `${progress}%`;
        
        container.appendChild(bar);
        
        return {
            element: container,
            setProgress: (value) => {
                bar.style.width = `${Math.min(100, Math.max(0, value))}%`;
            }
        };
    }
    
    // ========================================
    // INLINE LOADER
    // ========================================
    createInlineLoader() {
        const loader = document.createElement('span');
        loader.className = 'inline-loader';
        return loader;
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.loadingStates = new LoadingStates();
    });
} else {
    window.loadingStates = new LoadingStates();
}
