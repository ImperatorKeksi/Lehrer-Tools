// DebugMode Dummy-Funktion, falls nicht definiert
if (typeof window.debugMode !== 'function') {
    window.debugMode = function() { return false; };
}
/*
    ╔══════════════════════════════════════════════════╗
    ║  🎮 GAME MODULES - Spiellogik & State           ║
    ║  Zentrale Module für Zustandsverwaltung         ║
    ║                                                  ║                 ║
    ╚══════════════════════════════════════════════════╝
*/

// ==================== GAME STATE MANAGER ====================
// SPIEL-ZUSTAND VERWALTUNG          
// ===================================
class GameStateManager {
    constructor() {
        this.state = {
            phase: 'setup',      // setup, playing, paused, finished
            round: 1,
            currentPlayer: 0,
            score: {},
            usedQuestions: new Set(),
            dailyDoubles: new Set(),
            gameMode: null,
            difficulty: 'azubi1'
        };
        
        this.listeners = {};
        
        if (window.debugLog) {
            window.debugLog('🎮 GameStateManager initialisiert');
        }
    }
    
    // 📡 Event-System für Zustandsänderungen
    on(event, callback) {
        try {
            if (!event || typeof event !== 'string') {
                throw new Error('Event-Name muss ein String sein');
            }
            if (typeof callback !== 'function') {
                throw new Error('Callback muss eine Funktion sein');
            }
            
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        } catch (error) {
            console.error('❌ Fehler beim Registrieren des Event-Listeners:', error);
        }
    }
    
    emit(event, data) {
        try {
            if (!this.listeners[event]) return;
            
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Fehler in Event-Callback für "${event}":`, error);
                }
            });
        } catch (error) {
            console.error('❌ Fehler beim Auslösen des Events:', error);
        }
    }
    
    // 🔄 Zustand ändern
    setState(updates) {
        try {
            if (!updates || typeof updates !== 'object') {
                throw new Error('Updates müssen ein Objekt sein');
            }
            
            const oldState = { ...this.state };
            Object.assign(this.state, updates);
            
            this.emit('stateChanged', {
                oldState,
                newState: this.state,
                updates
            });
            
        } catch (error) {
            console.error('❌ Fehler beim Ändern des Zustands:', error);
            // Bei Fehler: Zustand nicht ändern
        }
    }
    
    // 📊 Zustand abrufen
    getState() {
        try {
            return { ...this.state };
        } catch (error) {
            console.error('❌ Fehler beim Abrufen des Zustands:', error);
            // Fallback: Leerer State
            return {
                phase: 'setup',
                round: 1,
                currentPlayer: 0,
                score: {},
                usedQuestions: new Set(),
                dailyDoubles: new Set(),
                gameMode: null,
                difficulty: 'azubi1'
            };
        }
    }
}

// ===================================
// PERFORMANCE MONITOR               
// ===================================
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameCount: 0,
            fps: 0,
            memoryUsage: 0,
            renderTime: 0,
            lastUpdate: performance.now()
        };
        
        this.isMonitoring = false;
        this.animationFrame = null;
        
        window.debugLog('⚡ PerformanceMonitor bereit');
    }
    
    // 📊 Monitoring starten
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateMetrics();
        
        console.log('📊 Performance-Monitoring gestartet');
    }
    
    // ⏹️ Monitoring stoppen
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        console.log('⏹️ Performance-Monitoring gestoppt');
    }
    
    // 🔄 Metriken aktualisieren
    updateMetrics() {
        if (!this.isMonitoring) return;
        
        const now = performance.now();
        const deltaTime = now - this.metrics.lastUpdate;
        
        // FPS berechnen
        this.metrics.frameCount++;
        if (deltaTime >= 1000) {
            this.metrics.fps = Math.round((this.metrics.frameCount * 1000) / deltaTime);
            this.metrics.frameCount = 0;
            this.metrics.lastUpdate = now;
            
            // Speicher-Nutzung (falls verfügbar)
            if (performance.memory) {
                this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
            }
            
            // FPS Counter anzeigen
            if (DEBUG_CONFIG.showFPS) {
                this.displayFPS();
            }
        }
        
        this.animationFrame = requestAnimationFrame(() => this.updateMetrics());
    }
    
    // 📺 FPS Counter anzeigen
    displayFPS() {
        let fpsDisplay = document.getElementById('fps-counter');
        if (!fpsDisplay) {
            fpsDisplay = document.createElement('div');
            fpsDisplay.id = 'fps-counter';
            fpsDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(fpsDisplay);
        }
        
        const { fps, memoryUsage } = this.metrics;
        const fpsColor = fps >= 30 ? '#00ff00' : fps >= 15 ? '#ffff00' : '#ff0000';
        
        fpsDisplay.innerHTML = `
            <div style="color: ${fpsColor}">FPS: ${fps}</div>
            ${memoryUsage > 0 ? `<div>RAM: ${memoryUsage} MB</div>` : ''}
        `;
    }
    
    // 📈 Metriken abrufen
    getMetrics() {
        return { ...this.metrics };
    }
}

// ===================================
// LAZY LOADING MANAGER              
// ===================================
class LazyLoadManager {
    constructor() {
        this.loadedResources = new Set();
        this.loadingPromises = new Map();
        
        console.log('📦 LazyLoadManager initialisiert');
    }
    
    // 📦 Resource lazy laden
    async loadResource(name, loadFunction) {
        if (this.loadedResources.has(name)) {
            return true;
        }
        
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }
        
        const promise = this.performLoad(name, loadFunction);
        this.loadingPromises.set(name, promise);
        
        return promise;
    }
    
    async performLoad(name, loadFunction) {
        try {
            console.log(`📦 Lade Resource: ${name}`);
            
            const startTime = performance.now();
            await loadFunction();
            const loadTime = performance.now() - startTime;
            
            this.loadedResources.add(name);
            this.loadingPromises.delete(name);
            
            console.log(`✅ Resource geladen: ${name} (${loadTime.toFixed(2)}ms)`);
            
            return true;
        } catch (error) {
            this.loadingPromises.delete(name);
            console.error(`❌ Fehler beim Laden: ${name}`, error);
            throw error;
        }
    }
    
    // 🧹 Cache leeren
    clearCache() {
        this.loadedResources.clear();
        this.loadingPromises.clear();
        
        console.log('🧹 Resource-Cache geleert');
    }
}

// ===================================
// GLOBALE INSTANZEN                 
// ===================================
window.gameState = new GameStateManager();
window.performanceMonitor = new PerformanceMonitor();
window.lazyLoader = new LazyLoadManager();

// 🔧 Debug-Hilfsfunktionen
if (typeof DEBUG_CONFIG !== 'undefined' && DEBUG_CONFIG.enabled) {
    window.startPerformanceMonitoring = () => performanceMonitor.startMonitoring();
    window.stopPerformanceMonitoring = () => performanceMonitor.stopMonitoring();
    window.getGameState = () => gameState.getState();
}