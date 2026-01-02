/*
    ╔══════════════════════════════════════════════════╗
    ║  📊 STATISTIKEN - Fragen-Analytics              ║
    ║  Tracking von Antworten & Schwierigkeitsgrad    ║
    ║                                                  ║
    ║  Entwickler: Nico Kaschube                      ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025                  ║
    ╚══════════════════════════════════════════════════╝
*/

// ==================== QUESTION STATS ====================
// 📊 QUESTION STATS KLASSE                                                    
// ============================================================================= 
class QuestionStats {
    constructor() {
        this.statsKey = 'jeopardy_question_stats';
        this.categoryStatsKey = 'jeopardy_category_stats';
        this.init();
    }

    init() {
        this.loadStats();
        console.log('📊 Question Stats initialized');
    }

    loadStats() {
        try {
            const data = localStorage.getItem(this.statsKey);
            this.questionStats = data ? JSON.parse(data) : {};
            
            const catData = localStorage.getItem(this.categoryStatsKey);
            this.categoryStats = catData ? JSON.parse(catData) : {};
        } catch (error) {
            console.error('❌ Failed to load stats:', error);
            this.questionStats = {};
            this.categoryStats = {};
        }
    }

    saveStats() {
        try {
            localStorage.setItem(this.statsKey, JSON.stringify(this.questionStats));
            localStorage.setItem(this.categoryStatsKey, JSON.stringify(this.categoryStats));
        } catch (error) {
            console.error('❌ Failed to save stats:', error);
        }
    }

    // =========================================================================
    // QUESTION TRACKING
    // =========================================================================
    
    getQuestionId(question, category) {
        // Create unique ID from question text + category
        return `${category}_${this.hashCode(question)}`;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    recordAnswer(question, category, isCorrect, timeTaken = 0) {
        const id = this.getQuestionId(question, category);
        
        if (!this.questionStats[id]) {
            this.questionStats[id] = {
                question: question,
                category: category,
                attempts: 0,
                correct: 0,
                incorrect: 0,
                totalTime: 0,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            };
        }

        const stat = this.questionStats[id];
        stat.attempts++;
        stat.lastSeen = new Date().toISOString();
        stat.totalTime += timeTaken;

        if (isCorrect) {
            stat.correct++;
        } else {
            stat.incorrect++;
        }

        // Update category stats
        this.updateCategoryStats(category, isCorrect);

        this.saveStats();
        console.log(`📊 Recorded: ${question.substring(0, 30)}... -> ${isCorrect ? '✅' : '❌'}`);
    }

    updateCategoryStats(category, isCorrect) {
        if (!this.categoryStats[category]) {
            this.categoryStats[category] = {
                name: category,
                attempts: 0,
                correct: 0,
                incorrect: 0,
                firstPlayed: new Date().toISOString(),
                lastPlayed: new Date().toISOString()
            };
        }

        const stat = this.categoryStats[category];
        stat.attempts++;
        stat.lastPlayed = new Date().toISOString();

        if (isCorrect) {
            stat.correct++;
        } else {
            stat.incorrect++;
        }
    }

    // =========================================================================
    // ANALYTICS & CALCULATIONS
    // =========================================================================
    
    getQuestionDifficulty(questionId) {
        const stat = this.questionStats[questionId];
        if (!stat || stat.attempts < 3) return 'unknown'; // Need at least 3 attempts

        const successRate = (stat.correct / stat.attempts) * 100;

        if (successRate >= 80) return 'easy';
        if (successRate >= 60) return 'medium';
        if (successRate >= 40) return 'hard';
        return 'very-hard';
    }

    getMostDifficultQuestions(limit = 10) {
        return Object.entries(this.questionStats)
            .filter(([_, stat]) => stat.attempts >= 3)
            .map(([id, stat]) => ({
                id,
                ...stat,
                successRate: (stat.correct / stat.attempts) * 100,
                difficulty: this.getQuestionDifficulty(id)
            }))
            .sort((a, b) => a.successRate - b.successRate)
            .slice(0, limit);
    }

    getEasiestQuestions(limit = 10) {
        return Object.entries(this.questionStats)
            .filter(([_, stat]) => stat.attempts >= 3)
            .map(([id, stat]) => ({
                id,
                ...stat,
                successRate: (stat.correct / stat.attempts) * 100,
                difficulty: this.getQuestionDifficulty(id)
            }))
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, limit);
    }

    getCategoryPerformance() {
        return Object.values(this.categoryStats)
            .map(stat => ({
                ...stat,
                successRate: stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0
            }))
            .sort((a, b) => b.successRate - a.successRate);
    }

    getMostPlayedCategories(limit = 5) {
        return Object.values(this.categoryStats)
            .sort((a, b) => b.attempts - a.attempts)
            .slice(0, limit);
    }

    getTotalStats() {
        const questions = Object.values(this.questionStats);
        const categories = Object.values(this.categoryStats);

        return {
            totalQuestions: questions.length,
            totalAttempts: questions.reduce((sum, q) => sum + q.attempts, 0),
            totalCorrect: questions.reduce((sum, q) => sum + q.correct, 0),
            totalIncorrect: questions.reduce((sum, q) => sum + q.incorrect, 0),
            overallSuccessRate: questions.length > 0 
                ? (questions.reduce((sum, q) => sum + q.correct, 0) / questions.reduce((sum, q) => sum + q.attempts, 0)) * 100 
                : 0,
            categoriesPlayed: categories.length,
            averageTimePerQuestion: questions.reduce((sum, q) => sum + q.totalTime, 0) / questions.reduce((sum, q) => sum + q.attempts, 0) || 0
        };
    }

    // =========================================================================
    // DATA EXPORT & MANAGEMENT
    // =========================================================================
    
    exportStats() {
        return {
            questionStats: this.questionStats,
            categoryStats: this.categoryStats,
            totalStats: this.getTotalStats(),
            exportedAt: new Date().toISOString()
        };
    }

    clearStats() {
        if (confirm('⚠️ Möchtest du wirklich alle Statistiken löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
            localStorage.removeItem(this.statsKey);
            localStorage.removeItem(this.categoryStatsKey);
            this.questionStats = {};
            this.categoryStats = {};
            console.log('🧹 Stats cleared');
            return true;
        }
        return false;
    }

    // =========================================================================
    // UI HELPER
    // =========================================================================
    
    getDifficultyColor(difficulty) {
        const colors = {
            'easy': '#10b981',      // green
            'medium': '#f59e0b',    // orange
            'hard': '#ef4444',      // red
            'very-hard': '#991b1b', // dark red
            'unknown': '#6b7280'    // gray
        };
        return colors[difficulty] || colors['unknown'];
    }

    getDifficultyEmoji(difficulty) {
        const emojis = {
            'easy': '🟢',
            'medium': '🟡',
            'hard': '🟠',
            'very-hard': '🔴',
            'unknown': '⚪'
        };
        return emojis[difficulty] || emojis['unknown'];
    }

    getDifficultyLabel(difficulty) {
        const labels = {
            'easy': 'Einfach',
            'medium': 'Mittel',
            'hard': 'Schwer',
            'very-hard': 'Sehr Schwer',
            'unknown': 'Unbekannt'
        };
        return labels[difficulty] || labels['unknown'];
    }
}

// ============================================================================= 
// INITIALIZE STATS                                                          
// ============================================================================= 

// Create global stats instance
let questionStats;

// Initialize after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        questionStats = new QuestionStats();
        window.questionStats = questionStats;
        console.log('✅ QuestionStats loaded');
        initStatsUI();
    });
} else {
    questionStats = new QuestionStats();
    window.questionStats = questionStats;
    console.log('✅ QuestionStats loaded');
    initStatsUI();
}


// ============================================================================= 
// STATS UI MANAGER                                                          
// ============================================================================= 

function initStatsUI() {
    const openStatsBtn = document.getElementById('openStatsBtn');
    const statsModal = document.getElementById('statsModal');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const closeStatsModalBtn = document.getElementById('closeStatsModalBtn');
    const exportStatsBtn = document.getElementById('exportStatsBtn');
    const clearStatsBtn = document.getElementById('clearStatsBtn');
    
    if (!openStatsBtn || !statsModal) {
        console.warn('Stats UI elements not found');
        return;
    }

    // Open modal
    openStatsBtn.addEventListener('click', () => {
        statsModal.classList.remove('hidden');
        renderStatsContent();
    });

    // Close modal
    const closeModal = () => {
        statsModal.classList.add('hidden');
    };

    closeStatsBtn?.addEventListener('click', closeModal);
    closeStatsModalBtn?.addEventListener('click', closeModal);

    // Close on backdrop click
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) closeModal();
    });

    // Tab switching
    document.querySelectorAll('.stats-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update tab buttons
            document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content
            document.querySelectorAll('.stats-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabName}Tab`).classList.add('active');
            
            renderStatsContent(tabName);
        });
    });

    // Export stats
    exportStatsBtn?.addEventListener('click', () => {
        const stats = questionStats.getAllStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jeopardy-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('✅ Statistiken exportiert!');
    });

    // Clear stats
    clearStatsBtn?.addEventListener('click', () => {
        if (confirm('🗑️ Alle Statistiken wirklich löschen? Dies kann nicht rückgängig gemacht werden!')) {
            questionStats.clearStats();
            renderStatsContent();
            showNotification('🗑️ Statistiken gelöscht');
        }
    });
}

function renderStatsContent(activeTab = 'questions') {
    if (activeTab === 'questions') {
        renderDifficultQuestions();
    } else if (activeTab === 'categories') {
        renderCategoryPerformance();
    } else if (activeTab === 'overall') {
        renderOverallStats();
    }
}

function renderDifficultQuestions() {
    const container = document.getElementById('difficultQuestionsTable');
    const difficultQuestions = questionStats.getMostDifficultQuestions(10);
    
    if (difficultQuestions.length === 0) {
        container.innerHTML = '<p class="stats-empty">Noch keine Daten verfügbar. Spiele zuerst einige Runden!</p>';
        return;
    }
    
    const getDifficultyBadge = (difficulty) => {
        const badges = {
            'easy': '<span class="difficulty-badge easy">🟢 Leicht</span>',
            'medium': '<span class="difficulty-badge medium">🟡 Mittel</span>',
            'hard': '<span class="difficulty-badge hard">🟠 Schwer</span>',
            'very-hard': '<span class="difficulty-badge very-hard">🔴 Sehr Schwer</span>'
        };
        return badges[difficulty] || difficulty;
    };
    
    const html = `
        <table class="stats-data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Frage</th>
                    <th>Kategorie</th>
                    <th>Schwierigkeit</th>
                    <th>Erfolgsrate</th>
                    <th>Versuche</th>
                </tr>
            </thead>
            <tbody>
                ${difficultQuestions.map((q, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="question-text">${q.question}</td>
                        <td>${q.category}</td>
                        <td>${getDifficultyBadge(q.difficulty)}</td>
                        <td>${q.successRate}%</td>
                        <td>${q.attempts}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function renderCategoryPerformance() {
    const container = document.getElementById('categoryPerformanceChart');
    const categoryStats = questionStats.getCategoryPerformance();
    
    if (categoryStats.length === 0) {
        container.innerHTML = '<p class="stats-empty">Noch keine Daten verfügbar.</p>';
        return;
    }
    
    const maxAttempts = Math.max(...categoryStats.map(c => c.attempts));
    
    const html = `
        <div class="category-bars">
            ${categoryStats.map(cat => {
                const successWidth = cat.successRate;
                const failWidth = 100 - cat.successRate;
                const barHeight = Math.max(30, (cat.attempts / maxAttempts) * 100);
                
                return `
                    <div class="category-bar-item">
                        <div class="category-bar-label">${cat.category}</div>
                        <div class="category-bar-container" style="height: ${barHeight}px;">
                            <div class="category-bar-fill success" style="width: ${successWidth}%" title="${cat.correct} richtig"></div>
                            <div class="category-bar-fill fail" style="width: ${failWidth}%" title="${cat.incorrect} falsch"></div>
                        </div>
                        <div class="category-bar-stats">
                            <span class="success-rate">${cat.successRate}%</span>
                            <span class="attempts-count">${cat.attempts} Versuche</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

function renderOverallStats() {
    const container = document.getElementById('overallStatsGrid');
    const allStats = questionStats.getAllStats();
    
    let totalQuestions = 0;
    let totalAttempts = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalTime = 0;
    let questionCount = 0;
    
    Object.values(allStats).forEach(stats => {
        totalQuestions++;
        totalAttempts += stats.attempts;
        totalCorrect += stats.correct;
        totalIncorrect += stats.incorrect;
        totalTime += stats.totalTime;
        questionCount += stats.attempts;
    });
    
    const successRate = totalAttempts > 0 ? ((totalCorrect / totalAttempts) * 100).toFixed(1) : 0;
    const avgTime = questionCount > 0 ? (totalTime / questionCount).toFixed(1) : 0;
    
    const html = `
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon">❓</div>
                <div class="stat-value">${totalQuestions}</div>
                <div class="stat-label">Verschiedene Fragen</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value">${totalAttempts}</div>
                <div class="stat-label">Gesamt Versuche</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">✅</div>
                <div class="stat-value">${totalCorrect}</div>
                <div class="stat-label">Richtig beantwortet</div>
            </div>
            <div class="stat-card fail">
                <div class="stat-icon">❌</div>
                <div class="stat-value">${totalIncorrect}</div>
                <div class="stat-label">Falsch beantwortet</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${successRate}%</div>
                <div class="stat-label">Erfolgsrate</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">${avgTime}s</div>
                <div class="stat-label">Ø Zeit pro Frage</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function showNotification(message) {
    // Reuse existing notification system if available
    if (window.showNotification) {
        window.showNotification(message);
    } else {
        alert(message);
    }
}
