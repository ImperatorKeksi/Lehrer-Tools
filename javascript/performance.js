/*
    ╔═══════════════════════════════════════════════════╗
    ║  ⚡ PERFORMANCE OPTIMIZER                         ║
    ║  Lazy Loading, Resource Hints, Optimization      ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0
        };
        
        this.init();
    }

    init() {
        this.measurePerformance();
        this.setupLazyLoading();
        this.setupResourceHints();
        this.optimizeImages();
        this.deferNonCriticalCSS();
        this.setupIntersectionObserver();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        this.logPerformanceMetrics();
        this.checkWebVitals();
    }

    // ========================================
    // PERFORMANCE MEASUREMENT
    // ========================================
    measurePerformance() {
        if (!window.performance) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const navigation = performance.getEntriesByType('navigation')[0];
                
                this.metrics.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                
                // Paint Timing
                const paintEntries = performance.getEntriesByType('paint');
                paintEntries.forEach(entry => {
                    if (entry.name === 'first-paint') {
                        this.metrics.firstPaint = entry.startTime;
                    }
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaint = entry.startTime;
                    }
                });
                
                // LCP (Largest Contentful Paint)
                this.observeLCP();
            }, 0);
        });
    }

    observeLCP() {
        if ('PerformanceObserver' in window) {
            try {
                const po = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
                });
                po.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                console.warn('LCP measurement not supported');
            }
        }
    }

    logPerformanceMetrics() {
        console.log('⚡ Performance Metrics:');
        console.log(`  Page Load: ${this.metrics.pageLoadTime}ms`);
        console.log(`  DOM Ready: ${this.metrics.domContentLoaded}ms`);
        console.log(`  FP: ${this.metrics.firstPaint.toFixed(2)}ms`);
        console.log(`  FCP: ${this.metrics.firstContentfulPaint.toFixed(2)}ms`);
        
        if (this.metrics.largestContentfulPaint > 0) {
            console.log(`  LCP: ${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
        }
    }

    checkWebVitals() {
        // Good, Needs Improvement, Poor thresholds
        const metrics = this.metrics;
        
        // FCP: <1.8s (Good), <3s (Needs Improvement), >=3s (Poor)
        if (metrics.firstContentfulPaint < 1800) {
            console.log('✅ FCP: Good');
        } else if (metrics.firstContentfulPaint < 3000) {
            console.log('⚠️ FCP: Needs Improvement');
        } else {
            console.log('❌ FCP: Poor');
        }
        
        // LCP: <2.5s (Good), <4s (Needs Improvement), >=4s (Poor)
        if (metrics.largestContentfulPaint > 0) {
            if (metrics.largestContentfulPaint < 2500) {
                console.log('✅ LCP: Good');
            } else if (metrics.largestContentfulPaint < 4000) {
                console.log('⚠️ LCP: Needs Improvement');
            } else {
                console.log('❌ LCP: Poor');
            }
        }
    }

    // ========================================
    // LAZY LOADING
    // ========================================
    setupLazyLoading() {
        // Native Lazy Loading für Bilder
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });
        
        // Lazy Load für iframes
        const iframes = document.querySelectorAll('iframe:not([loading])');
        iframes.forEach(iframe => {
            iframe.loading = 'lazy';
        });
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add decoding="async" für bessere Performance
            if (!img.hasAttribute('decoding')) {
                img.decoding = 'async';
            }
            
            // Füge Lazy Loading hinzu falls nicht vorhanden
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
            
            // Warn wenn alt fehlt (Accessibility)
            if (!img.hasAttribute('alt') && !img.classList.contains('decorative')) {
                console.warn('⚠️ Missing alt attribute:', img.src);
            }
        });
    }

    // ========================================
    // RESOURCE HINTS
    // ========================================
    setupResourceHints() {
        // Preconnect zu wichtigen Origins
        this.addPreconnect('https://fonts.googleapis.com');
        this.addPreconnect('https://fonts.gstatic.com');
        
        // DNS Prefetch
        this.addDNSPrefetch('https://www.google-analytics.com');
        
        // Preload kritische Assets
        this.preloadCriticalAssets();
    }

    addPreconnect(url) {
        if (document.querySelector(`link[rel="preconnect"][href="${url}"]`)) return;
        
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    addDNSPrefetch(url) {
        if (document.querySelector(`link[rel="dns-prefetch"][href="${url}"]`)) return;
        
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    preloadCriticalAssets() {
        // Preload kritische CSS
        const criticalCSS = [
            '../stylesheets/theme.css',
            '../stylesheets/main.css'
        ];
        
        criticalCSS.forEach(href => {
            if (document.querySelector(`link[href*="${href.split('/').pop()}"]`)) return;
            
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    }

    // ========================================
    // DEFER NON-CRITICAL CSS
    // ========================================
    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
        
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        });
    }

    // ========================================
    // INTERSECTION OBSERVER (für Heavy Content)
    // ========================================
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Lazy load background images
                    if (element.dataset.bgImage) {
                        element.style.backgroundImage = `url(${element.dataset.bgImage})`;
                        delete element.dataset.bgImage;
                    }
                    
                    // Load iframe src
                    if (element.tagName === 'IFRAME' && element.dataset.src) {
                        element.src = element.dataset.src;
                        delete element.dataset.src;
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe elements mit data-lazy
        document.querySelectorAll('[data-lazy]').forEach(el => {
            observer.observe(el);
        });
    }

    // ========================================
    // DEBOUNCE & THROTTLE UTILITIES
    // ========================================
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================
    // REQUEST IDLE CALLBACK
    // ========================================
    static requestIdleCallback(callback) {
        if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(callback);
        } else {
            return setTimeout(callback, 1);
        }
    }

    // ========================================
    // PREFETCH NAVIGATION
    // ========================================
    setupPrefetch() {
        const links = document.querySelectorAll('a[href^="/"], a[href^="../"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    this.prefetchPage(link.href);
                    observer.unobserve(link);
                }
            });
        });

        links.forEach(link => observer.observe(link));
    }

    prefetchPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    // ========================================
    // MEMORY MANAGEMENT
    // ========================================
    static cleanupMemory() {
        // Remove unused event listeners
        const oldNodes = document.querySelectorAll('[data-cleanup]');
        oldNodes.forEach(node => {
            const clone = node.cloneNode(true);
            node.parentNode.replaceChild(clone, node);
        });
        
        // Trigger garbage collection (if available in dev tools)
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
    }

    // ========================================
    // CRITICAL CSS EXTRACTION
    // ========================================
    extractCriticalCSS() {
        const used = new Set();
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            used.add(el.tagName.toLowerCase());
            el.classList.forEach(cls => used.add(`.${cls}`));
            if (el.id) used.add(`#${el.id}`);
        });
        
        console.log('🎨 Critical CSS selectors:', used);
        return Array.from(used);
    }

    // ========================================
    // BUNDLE SIZE ANALYSIS
    // ========================================
    analyzeBundleSize() {
        if (!performance.getEntriesByType) return;
        
        const resources = performance.getEntriesByType('resource');
        const analysis = {
            css: [],
            js: [],
            images: [],
            fonts: [],
            total: 0
        };
        
        resources.forEach(resource => {
            const size = resource.transferSize || resource.encodedBodySize || 0;
            analysis.total += size;
            
            if (resource.name.endsWith('.css')) {
                analysis.css.push({ name: resource.name, size });
            } else if (resource.name.endsWith('.js')) {
                analysis.js.push({ name: resource.name, size });
            } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
                analysis.images.push({ name: resource.name, size });
            } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/)) {
                analysis.fonts.push({ name: resource.name, size });
            }
        });
        
        console.log('📦 Bundle Analysis:');
        console.log(`  Total: ${(analysis.total / 1024).toFixed(2)} KB`);
        console.log(`  CSS: ${analysis.css.length} files (${(analysis.css.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB)`);
        console.log(`  JS: ${analysis.js.length} files (${(analysis.js.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB)`);
        console.log(`  Images: ${analysis.images.length} files (${(analysis.images.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB)`);
        console.log(`  Fonts: ${analysis.fonts.length} files (${(analysis.fonts.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB)`);
        
        // Warn über große Dateien
        [...analysis.css, ...analysis.js].forEach(file => {
            if (file.size > 100000) { // > 100KB
                console.warn(`⚠️ Large file: ${file.name.split('/').pop()} (${(file.size / 1024).toFixed(2)} KB)`);
            }
        });
        
        return analysis;
    }

    // ========================================
    // PERFORMANCE REPORT
    // ========================================
    generateReport() {
        const report = {
            metrics: this.metrics,
            bundleSize: this.analyzeBundleSize(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connection: this.getConnectionInfo()
        };
        
        console.log('📊 Performance Report:', report);
        return report;
    }

    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return null;
    }

    // ========================================
    // PUBLIC API
    // ========================================
    getMetrics() {
        return this.metrics;
    }

    enableSaveDataMode() {
        // Reduziere Qualität/Features bei langsamer Verbindung
        if (navigator.connection && navigator.connection.saveData) {
            document.documentElement.classList.add('save-data-mode');
            console.log('💾 Save-Data mode enabled');
            
            // Disable animations
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-normal', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
        }
    }
}

// ========================================
// AUTO-INIT
// ========================================
let performanceOptimizer;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        performanceOptimizer = new PerformanceOptimizer();
        window.performanceOptimizer = performanceOptimizer;
    });
} else {
    performanceOptimizer = new PerformanceOptimizer();
    window.performanceOptimizer = performanceOptimizer;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
