/*
    ╔═══════════════════════════════════════════════════╗
    ║  📊 STATISTICS SYSTEM                             ║
    ║  Game Stats, Tool Usage, Recent Activity         ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

class StatisticsController {
    constructor() {
        this.STORAGE_KEY = 'lehrertools-statistics';
        this.stats = this.loadStats();
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupAutoSave();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.injectStatsWidget();
            });
        } else {
            this.injectStatsWidget();
        }
    }

    // ========================================
    // STATISTICS DATA STRUCTURE
    // ========================================
    getDefaultStats() {
        return {
            version: '2.0.0',
            created: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            
            // Page Views
            pageViews: {
                total: 0,
                pages: {}
            },
            
            // Game Statistics
            games: {
                jeopardy: {
                    gamesPlayed: 0,
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    totalPoints: 0,
                    highscore: 0,
                    lastPlayed: null,
                    categories: {}
                },
                timer: {
                    timersStarted: 0,
                    totalTimeMinutes: 0,
                    averageTime: 0,
                    lastUsed: null
                },
                stadtLandFluss: {
                    gamesPlayed: 0,
                    roundsPlayed: 0,
                    lastPlayed: null
                },
                zufallsgenerator: {
                    numbersGenerated: 0,
                    listsGenerated: 0,
                    lastUsed: null
                },
                notenrechner: {
                    calculationsTotal: 0,
                    averageGrade: 0,
                    bestGrade: 6,
                    grades: [],
                    lastUsed: null
                },
                aufgabenroulette: {
                    spinsTotal: 0,
                    tasksGenerated: 0,
                    lastUsed: null
                }
            },
            
            // Tool Usage
            toolUsage: {
                mostUsed: null,
                leastUsed: null,
                tools: {}
            },
            
            // Recent Activity
            recentActivity: [],
            
            // Session Info
            sessions: {
                total: 0,
                currentSession: {
                    start: new Date().toISOString(),
                    pageViews: 0,
                    actions: 0
                }
            },
            
            // Preferences
            preferences: {
                favoriteTools: [],
                customCategories: []
            }
        };
    }

    loadStats() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const stats = JSON.parse(saved);
                return { ...this.getDefaultStats(), ...stats };
            }
        } catch (error) {
            console.error('❌ Stats load error:', error);
        }
        return this.getDefaultStats();
    }

    saveStats() {
        try {
            this.stats.lastUpdate = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
        } catch (error) {
            console.error('❌ Stats save error:', error);
        }
    }

    setupAutoSave() {
        // Auto-save alle 30 Sekunden
        setInterval(() => {
            this.saveStats();
        }, 30000);
        
        // Save beim Verlassen
        window.addEventListener('beforeunload', () => {
            this.saveStats();
        });
    }

    // ========================================
    // PAGE TRACKING
    // ========================================
    trackPageView() {
        const pageName = this.getCurrentPageName();
        
        this.stats.pageViews.total++;
        this.stats.pageViews.pages[pageName] = (this.stats.pageViews.pages[pageName] || 0) + 1;
        this.stats.sessions.currentSession.pageViews++;
        
        this.addRecentActivity('page_view', pageName);
        this.updateToolUsage(pageName);
        
        console.log(`📊 Page view tracked: ${pageName}`);
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'start';
        return page;
    }

    // ========================================
    // GAME TRACKING
    // ========================================
    trackGameStart(gameName) {
        const game = this.stats.games[gameName];
        if (!game) return;
        
        game.gamesPlayed++;
        game.lastPlayed = new Date().toISOString();
        this.addRecentActivity('game_start', gameName);
        this.saveStats();
    }

    trackGameEnd(gameName, data = {}) {
        const game = this.stats.games[gameName];
        if (!game) return;
        
        // Jeopardy specifisch
        if (gameName === 'jeopardy') {
            if (data.points) {
                game.totalPoints += data.points;
                if (data.points > game.highscore) {
                    game.highscore = data.points;
                }
            }
            if (data.correct !== undefined) game.correctAnswers += data.correct;
            if (data.wrong !== undefined) game.wrongAnswers += data.wrong;
            game.questionsAnswered += (data.correct || 0) + (data.wrong || 0);
        }
        
        this.addRecentActivity('game_end', gameName, data);
        this.saveStats();
    }

    trackQuestion(gameName, category, correct) {
        if (gameName === 'jeopardy') {
            const game = this.stats.games.jeopardy;
            if (!game.categories[category]) {
                game.categories[category] = {
                    total: 0,
                    correct: 0,
                    wrong: 0
                };
            }
            
            game.categories[category].total++;
            if (correct) {
                game.categories[category].correct++;
            } else {
                game.categories[category].wrong++;
            }
        }
        
        this.saveStats();
    }

    trackToolUsage(toolName, action, data = {}) {
        const tool = this.stats.games[toolName];
        if (!tool) return;
        
        tool.lastUsed = new Date().toISOString();
        
        // Tool-spezifische Tracking
        switch (toolName) {
            case 'timer':
                if (action === 'start' && data.minutes) {
                    tool.timersStarted++;
                    tool.totalTimeMinutes += data.minutes;
                    tool.averageTime = tool.totalTimeMinutes / tool.timersStarted;
                }
                break;
                
            case 'notenrechner':
                if (action === 'calculate' && data.grade) {
                    tool.calculationsTotal++;
                    tool.grades.push({
                        grade: data.grade,
                        date: new Date().toISOString()
                    });
                    
                    // Keep only last 100 grades
                    if (tool.grades.length > 100) {
                        tool.grades = tool.grades.slice(-100);
                    }
                    
                    // Calculate average
                    const sum = tool.grades.reduce((acc, g) => acc + g.grade, 0);
                    tool.averageGrade = sum / tool.grades.length;
                    
                    // Best grade
                    if (data.grade < tool.bestGrade) {
                        tool.bestGrade = data.grade;
                    }
                }
                break;
                
            case 'zufallsgenerator':
                if (action === 'generate_number') tool.numbersGenerated++;
                if (action === 'generate_list') tool.listsGenerated++;
                break;
                
            case 'aufgabenroulette':
                if (action === 'spin') tool.spinsTotal++;
                if (action === 'task_generated') tool.tasksGenerated++;
                break;
                
            case 'stadtLandFluss':
                if (action === 'game_start') tool.gamesPlayed++;
                if (action === 'round_complete') tool.roundsPlayed++;
                break;
        }
        
        this.addRecentActivity('tool_usage', toolName, { action, ...data });
        this.updateToolUsage(toolName);
        this.saveStats();
    }

    updateToolUsage(toolName) {
        const tools = this.stats.toolUsage.tools;
        tools[toolName] = (tools[toolName] || 0) + 1;
        
        // Update most/least used
        let max = 0, min = Infinity;
        let maxTool = null, minTool = null;
        
        Object.entries(tools).forEach(([name, count]) => {
            if (count > max) {
                max = count;
                maxTool = name;
            }
            if (count < min) {
                min = count;
                minTool = name;
            }
        });
        
        this.stats.toolUsage.mostUsed = maxTool;
        this.stats.toolUsage.leastUsed = minTool;
    }

    // ========================================
    // RECENT ACTIVITY
    // ========================================
    addRecentActivity(type, name, data = {}) {
        this.stats.recentActivity.unshift({
            type,
            name,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        if (this.stats.recentActivity.length > 50) {
            this.stats.recentActivity = this.stats.recentActivity.slice(0, 50);
        }
    }

    getRecentActivity(limit = 10) {
        return this.stats.recentActivity.slice(0, limit);
    }

    // ========================================
    // STATS WIDGET
    // ========================================
    injectStatsWidget() {
        const pageName = this.getCurrentPageName();
        
        // Nur auf START/index Seite
        if (pageName !== 'START' && pageName !== 'index') return;
        
        // Prüfe ob ein geeigneter Container existiert
        const mainContainer = document.querySelector('main, .container, .main-container');
        if (!mainContainer) {
            console.log('⚠️ No suitable container for stats widget found');
            return;
        }
        
        const widget = document.createElement('div');
        widget.id = 'stats-widget';
        widget.className = 'stats-widget';
        widget.innerHTML = this.generateStatsWidgetHTML();
        
        // Nach dem ersten .panel einfügen, oder am Ende des Containers
        const firstPanel = mainContainer.querySelector('.panel');
        if (firstPanel && firstPanel.parentNode) {
            firstPanel.parentNode.insertBefore(widget, firstPanel.nextSibling);
        } else {
            mainContainer.appendChild(widget);
        }
    }

    generateStatsWidgetHTML() {
        const recent = this.getRecentActivity(5);
        const mostUsed = this.stats.toolUsage.mostUsed;
        const jeopardy = this.stats.games.jeopardy;
        
        return `
            <div class="stats-widget-content">
                <div class="stats-header">
                    <h3>📊 Deine Statistiken</h3>
                    <button class="stats-expand-btn" onclick="window.statsController.showFullStats()">
                        Details
                    </button>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👁️</div>
                        <div class="stat-value">${this.stats.pageViews.total}</div>
                        <div class="stat-label">Seitenaufrufe</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-value">${jeopardy.gamesPlayed}</div>
                        <div class="stat-label">Jeopardy Spiele</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${jeopardy.correctAnswers}</div>
                        <div class="stat-label">Richtige Antworten</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${jeopardy.highscore}</div>
                        <div class="stat-label">Highscore</div>
                    </div>
                </div>
                
                ${mostUsed ? `
                    <div class="stats-section">
                        <h4>⭐ Am meisten genutzt</h4>
                        <div class="most-used-tool">
                            <span class="tool-name">${this.formatToolName(mostUsed)}</span>
                            <span class="tool-count">${this.stats.toolUsage.tools[mostUsed]}× verwendet</span>
                        </div>
                    </div>
                ` : ''}
                
                ${recent.length > 0 ? `
                    <div class="stats-section">
                        <h4>🕒 Zuletzt verwendet</h4>
                        <div class="recent-activity-list">
                            ${recent.map(activity => `
                                <div class="activity-item">
                                    <span class="activity-icon">${this.getActivityIcon(activity.type)}</span>
                                    <span class="activity-name">${this.formatToolName(activity.name)}</span>
                                    <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showFullStats() {
        // TODO: Create full stats modal
        console.log('📊 Full Stats:', this.stats);
        
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification(
                '📊 Vollständige Statistiken werden bald verfügbar sein!',
                'info',
                3000
            );
        }
    }

    // ========================================
    // HELPERS
    // ========================================
    formatToolName(name) {
        const names = {
            'jeopardy': 'IT Jeopardy',
            'timer': 'Timer',
            'stadtLandFluss': 'Stadt-Land-Fluss',
            'zufallsgenerator': 'Zufallsgenerator',
            'notenrechner': 'Notenrechner',
            'aufgabenroulette': 'Aufgabenroulette',
            'game': 'IT Jeopardy',
            'index': 'Startseite',
            'START': 'Startseite'
        };
        return names[name] || name;
    }

    getActivityIcon(type) {
        const icons = {
            'page_view': '👁️',
            'game_start': '🎮',
            'game_end': '🏁',
            'tool_usage': '🔧'
        };
        return icons[type] || '📌';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const seconds = Math.floor((now - past) / 1000);
        
        if (seconds < 60) return 'Gerade eben';
        if (seconds < 3600) return `vor ${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)}h`;
        return `vor ${Math.floor(seconds / 86400)}d`;
    }

    // ========================================
    // EXPORT & IMPORT
    // ========================================
    exportStats() {
        const dataStr = JSON.stringify(this.stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `lehrertools-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📥 Stats exported');
    }

    importStats(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this.stats = { ...this.getDefaultStats(), ...imported };
                this.saveStats();
                
                if (typeof AnimationsController !== 'undefined') {
                    AnimationsController.showNotification(
                        '✅ Statistiken erfolgreich importiert!',
                        'success',
                        3000
                    );
                }
            } catch (error) {
                console.error('❌ Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    resetStats() {
        if (confirm('⚠️ Möchtest du wirklich alle Statistiken zurücksetzen?')) {
            this.stats = this.getDefaultStats();
            this.saveStats();
            
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification(
                    '🔄 Statistiken zurückgesetzt',
                    'warning',
                    3000
                );
            }
            
            location.reload();
        }
    }

    // ========================================
    // PUBLIC API
    // ========================================
    getStats() {
        return this.stats;
    }

    getGameStats(gameName) {
        return this.stats.games[gameName];
    }

    getTotalGamesPlayed() {
        return Object.values(this.stats.games)
            .reduce((sum, game) => sum + (game.gamesPlayed || 0), 0);
    }

    getAccuracyRate() {
        const jeopardy = this.stats.games.jeopardy;
        const total = jeopardy.correctAnswers + jeopardy.wrongAnswers;
        if (total === 0) return 0;
        return Math.round((jeopardy.correctAnswers / total) * 100);
    }
}

// ========================================
// AUTO-INIT
// ========================================
let statsController;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        statsController = new StatisticsController();
        window.statsController = statsController;
    });
} else {
    statsController = new StatisticsController();
    window.statsController = statsController;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsController;
}
