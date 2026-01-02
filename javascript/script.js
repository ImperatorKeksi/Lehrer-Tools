/*
    ╔═════════════════════════════════════════════════╗
    ║  🎮 JEOPARDY QUIZ - HAUPTSPIEL-LOGIK           ║
    ║  Kernfunktionalität des Quiz-Spiels            ║
    ║                                                 ║
    ║  Entwickler: Nico Kaschube                     ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025                 ║
    ╚═════════════════════════════════════════════════╝
*/

// ==================== DEBUG KONFIGURATION ====================
const DEBUG_CONFIG = {
    enabled: false, // Hauptschalter für Debug-Modus (false für Production) - DEAKTIVIERT, nutze window.debugLog aus production-config.js
    verbose: false, // Detaillierte Logs
    performance: false, // Performance-Messungen
    showFPS: false, // FPS Counter
    logLevel: 'info', // Log-Level: 'error', 'warn', 'info', 'debug'
    modules: {
        game: true,     // Spiel-Logik
        audio: true,    // Audio-System
        ui: true,       // Benutzeroberfläche
        statistics: true, // Statistiken
        timer: true,    // Timer-System
        questions: true // Fragen-Management
    }
};

// ==================== DEBUG LOGGER ====================
class DebugLogger {
    constructor(config) {
        this.config = config;
        this.startTime = performance.now();
        this.logCount = 0;
    }
    
    // 📝 Hauptlog-Funktion
    log(level, module, message, data = null) {
        if (!this.config.enabled) return;
        if (!this.config.modules[module]) return;
        
        this.logCount++;
        const timestamp = Math.round(performance.now() - this.startTime);
        const prefix = `[${timestamp}ms] [${module.toUpperCase()}] #${this.logCount}`;
        
        // Emoji-Icons für bessere Lesbarkeit
        const icons = {
            error: '🔴',
            warn: '🟡', 
            info: '🔵',
            debug: '⚪'
        };
        
        const icon = icons[level] || '⚫';
        
        switch (level) {
            case 'error':
                console.error(`${icon} ${prefix}`, message, data || '');
                break;
            case 'warn':
                console.warn(`${icon} ${prefix}`, message, data || '');
                break;
            case 'info':
                if (['info', 'debug'].includes(this.config.logLevel)) {
                    console.info(`${icon} ${prefix}`, message, data || '');
                }
                break;
            case 'debug':
                if (this.config.verbose && this.config.logLevel === 'debug') {
                    console.debug(`${icon} ${prefix}`, message, data || '');
                }
                break;
        }
    }
    
    // ⏱️ Performance-Messungen
    performance(label, fn) {
        if (!this.config.performance) return fn();
        
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        this.log('info', 'performance', `⚡ ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    // 📊 Statistiken anzeigen
    showStats() {
        if (!this.config.enabled) return;
        
        console.group('📊 Debug-Statistiken');
        console.log(`⏰ Laufzeit: ${Math.round(performance.now() - this.startTime)}ms`);
        console.log(`📝 Log-Nachrichten: ${this.logCount}`);
        console.log(`🧠 Speicher:`, performance.memory || 'Nicht verfügbar');
        console.groupEnd();
    }
    
    // 🔧 Debug-Panel umschalten
    toggleDebugMode() {
        this.config.enabled = !this.config.enabled;
        this.log('info', 'debug', `Debug-Modus ${this.config.enabled ? 'aktiviert' : 'deaktiviert'}`);
        
        if (this.config.enabled) {
            console.log(`
🔧 DEBUG-MODUS AKTIVIERT 🔧
─────────────────────────────
Verfügbare Befunde:
• debugLog.showStats() - Statistiken anzeigen
• debugLog.config.verbose = true - Verbose Modus
• debugLog.config.performance = true - Performance
• DEBUG_CONFIG.modules.xxx = false - Module deaktivieren
─────────────────────────────
            `);
        }
    }
}

// 🌐 Globaler Debug Logger (lokale Instanz für script.js)
const scriptDebugLogger = new DebugLogger(DEBUG_CONFIG);

// 🔧 Debug-Funktionen global verfügbar machen (nur wenn noch nicht vorhanden)
if (!window.enableDebug) {
    window.enableDebug = () => scriptDebugLogger.toggleDebugMode();
}
if (!window.debugStats) {
    window.debugStats = () => scriptDebugLogger.showStats();
}
// window.debugLog existiert bereits von production-config.js - nicht überschreiben!

/* ============================================================================= */
/* JEOPARDY SPIEL HAUPTKLASSE                                                   */
/* ============================================================================= */

// Jeopardy Game Logic
class JeopardyGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameData = null; // Will be loaded on game start
        this.usedQuestions = new Set();
        this.gameMode = null; // 'single' or 'group'
        this.round = 1;
        this.maxRounds = 1; // Can be extended for multiple rounds
        
        // New features
        this.soundManager = new window.SoundManager();
        this.currentTheme = 'purple-blue';
        this.dailyDoublesEnabled = true;
        this.dailyDoubles = new Set();
        this.currentWager = 0;
        this.timerEnabled = false;
        this.timerDuration = 60; // Configurable timer duration in seconds
        this.timerInterval = null;
        this.timeLeft = 60;
        this.animationsEnabled = true;
        this.isPaused = false;
        
        // Statistics and Achievements
        this.gameStats = {
            questionsAnswered: 0,
            totalQuestions: 25,
            gameStartTime: null,
            streaks: {},
            categoryStats: {}
        };
        
        // Initialize statistics from localStorage
        this.loadPlayerStats();
        
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.initializeDebugControls();
        this.initializeAnalytics();
        this.showSetupScreen();
        
        // ✅ FIXED: debugLog ist eine Funktion, kein Objekt!
        console.log('🎮 Jeopardy-Spiel initialisiert');
    }

    bindEventListeners() {
        // Performance: Event Delegation für bessere Performance
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('change', this.handleGlobalChange.bind(this));
        
        // Setup screen events
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectGameMode(e.target.dataset.mode));
        });

        document.getElementById('playerCount').addEventListener('change', (e) => {
            this.updatePlayerInputs(parseInt(e.target.value));
        });

        document.getElementById('groupCount').addEventListener('change', (e) => {
            this.updateGroupInputs(parseInt(e.target.value));
        });

        document.getElementById('startGame').addEventListener('click', () => this.startGame());

        // Settings events
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundManager.setEnabled(e.target.checked);
        });

        document.getElementById('dailyDoublesToggle').addEventListener('change', (e) => {
            this.dailyDoublesEnabled = e.target.checked;
        });

        document.getElementById('animationToggle').addEventListener('change', (e) => {
            this.animationsEnabled = e.target.checked;
            document.body.classList.toggle('no-animations', !e.target.checked);
        });

        document.getElementById('timerToggle').addEventListener('change', (e) => {
            this.timerEnabled = e.target.checked;
            this.toggleTimerConfig(e.target.checked);
        });
        
        // Timer configuration listeners
        document.getElementById('timerDuration').addEventListener('input', (e) => {
            this.timerDuration = parseInt(e.target.value);
            this.updateTimerDisplayText();
        });
        
        // Timer preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = parseInt(e.target.dataset.time);
                this.setTimerDuration(time);
            });
        });

        // Quick Actions
        document.getElementById('pauseGameBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('showRulesBtn').addEventListener('click', () => this.showRules());
        
        // Fullscreen Change Event - Button-Status aktualisieren
        document.addEventListener('fullscreenchange', () => {
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                if (document.fullscreenElement) {
                    fullscreenBtn.innerHTML = '🔲';
                    fullscreenBtn.title = 'Vollbild verlassen (F11 oder ESC)';
                } else {
                    fullscreenBtn.innerHTML = '🔳';
                    fullscreenBtn.title = 'Vollbild (F11)';
                }
            }
        });
        
        // Help and Pause
        document.getElementById('closeHelpBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeRulesBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeRulesBtn2').addEventListener('click', () => this.closeModal());
        document.getElementById('resumeGameBtn').addEventListener('click', () => this.togglePause());

        // Game screen events
        document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('endGameBtn').addEventListener('click', () => this.endGame());

        // Modal events handled by global event delegation

        // Modal backdrop clicks
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => this.closeModal());
        });

        // Daily Double events
        document.getElementById('confirmWagerBtn').addEventListener('click', () => this.confirmWager());
        document.querySelectorAll('.wager-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectWager(e.target));
        });
        document.getElementById('allInBtn').addEventListener('click', () => this.selectAllIn());

        // Add click sounds to interactive elements
        this.addClickSounds();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
        
        // Initialize timer configuration display
        this.initializeTimerConfig();
        
        // Performance optimizations
        this.optimizePerformance();
    }

    // 🚀 Performance-Verbesserungen
    optimizePerformance() {
        // Lazy loading für Sounds
        this.soundManager.preloadEssentialSounds();
        
        // Debounce für häufige Events
        this.addDebouncedEvents();
        
        // Virtualisierung für große Listen (falls nötig)
        this.optimizeAnimations();
    }

    addDebouncedEvents() {
        // Debounce function
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        // Debounce Timer-Updates
        const debouncedTimerUpdate = debounce(() => {
            this.updateTimerDisplayText();
        }, 100);

        // Ersetze den originalen Event-Listener
        document.getElementById('timerDuration').removeEventListener('input', this.updateTimerDisplayText);
        document.getElementById('timerDuration').addEventListener('input', debouncedTimerUpdate);
    }

    optimizeAnimations() {
        // CSS will-change für bessere Animation-Performance
        const animatedElements = document.querySelectorAll('.question-card, .modal, .point-animation');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });

        // Cleanup after animations
        document.addEventListener('animationend', (e) => {
            if (e.target.classList.contains('flip') || e.target.classList.contains('point-animation')) {
                e.target.style.willChange = 'auto';
            }
        });
    }

    // Timer Configuration Methods
    initializeTimerConfig() {
        this.updateTimerDisplayText();
        this.toggleTimerConfig(this.timerEnabled);
        
        // Set initial preset button state
        this.updatePresetButtons(this.timerDuration);
    }

    toggleTimerConfig(show) {
        const timerConfig = document.getElementById('timerConfig');
        timerConfig.style.display = show ? 'block' : 'none';
    }

    updateTimerDisplayText() {
        const display = document.getElementById('timerDisplay');
        display.textContent = `${this.timerDuration} Sekunden`;
    }

    setTimerDuration(duration) {
        this.timerDuration = duration;
        document.getElementById('timerDuration').value = duration;
        this.updateTimerDisplayText();
        this.updatePresetButtons(duration);
    }

    updatePresetButtons(activeDuration) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            const btnDuration = parseInt(btn.dataset.time);
            btn.classList.toggle('active', btnDuration === activeDuration);
        });
    }

    selectGameMode(mode) {
        this.gameMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        // Show player setup
        document.getElementById('playerSetup').classList.remove('hidden');

        if (mode === 'single') {
            document.getElementById('setupTitle').textContent = 'Einzelspieler hinzufügen';
            document.getElementById('singlePlayerSetup').classList.remove('hidden');
            document.getElementById('groupPlayerSetup').classList.add('hidden');
            this.updatePlayerInputs(2);
        } else {
            document.getElementById('setupTitle').textContent = 'Gruppen hinzufügen';
            document.getElementById('singlePlayerSetup').classList.add('hidden');
            document.getElementById('groupPlayerSetup').classList.remove('hidden');
            this.updateGroupInputs(2);
        }
    }

    updatePlayerInputs(count) {
        const container = document.getElementById('playerNames');
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-name';
            input.placeholder = `Spieler ${i + 1} Name`;
            input.value = `Spieler ${i + 1}`;
            container.appendChild(input);
        }
    }

    updateGroupInputs(count) {
        const container = document.getElementById('groupNames');
        container.innerHTML = '';
        
        const groupNames = ['Alpha', 'Beta', 'Gamma', 'Delta'];
        
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'group-name';
            input.placeholder = `Gruppe ${i + 1} Name`;
            input.value = `Team ${groupNames[i]}`;
            container.appendChild(input);
        }
    }

    startGame() {
        this.setupPlayers();
        
        if (this.players.length < 2) {
            alert('Mindestens 2 Spieler/Gruppen erforderlich!');
            return;
        }

        // Load game data
        this.gameData = this.loadGameData();

        // Initialize game statistics
        this.gameStats.gameStartTime = new Date();
        this.gameStats.questionsAnswered = 0;
        this.initializePlayerGameStats();

        this.showGameScreen();
        this.initializeBoard();
        this.updatePlayerDisplay();
        this.updateCurrentPlayer();
        this.updateGameStats();
        
        // Setup Daily Doubles
        if (this.dailyDoublesEnabled) {
            this.setupDailyDoubles();
        }
        
        // Play theme sound
        this.soundManager.play('theme');
        
        // Track Game Start
        if (window.analyticsEvents) {
            window.analyticsEvents.gameStarted(
                this.gameMode,
                this.gameData.categories.map(c => c.name),
                {
                    playerCount: this.players.length,
                    timerEnabled: this.timerEnabled,
                    dailyDoublesEnabled: this.dailyDoublesEnabled,
                    selectedCategories: this.gameData.categories.length
                }
            );
            window.analyticsEvents.screenViewed('game_screen');
        }
    }

    loadGameData() {
        // Check if custom questions are available from the editor
        if (window.editor && window.editor.hasCustomQuestions()) {
            const customData = window.editor.getCustomQuestions();
            
            if (customData && customData.categories && customData.categories.length > 0) {
                // Choose 5 RANDOM questions from each category for the game
                const categories = customData.categories.map(category => {
                    // Sortiere die Fragen nach Punktewert (100, 200, 300, 400, 500)
                    const sortedQuestions = [...category.questions].sort((a, b) => (a.points || 100) - (b.points || 100));
                    // Nimm die ersten 5 (eine pro Punktewert)
                    const selectedQuestions = [100,200,300,400,500].map(points =>
                        sortedQuestions.find(q => (q.points || 100) === points) || null
                    ).filter(Boolean);
                    return {
                        name: category.name,
                        questions: selectedQuestions
                    };
                });
                return { categories: categories };
            }
        }
        
        // Fall back to default jeopardyData
        if (typeof jeopardyData === 'undefined') {
            console.error('jeopardyData not found!');
            return { categories: [] };
        }

        // Choose 5 RANDOM questions from each category for the game
        const categories = jeopardyData.categories.map(category => {
            // Sortiere die Fragen nach Punktewert (100, 200, 300, 400, 500)
            const sortedQuestions = [...category.questions].sort((a, b) => (a.points || 100) - (b.points || 100));
            // Nimm die ersten 5 (eine pro Punktewert)
            const selectedQuestions = [100,200,300,400,500].map(points =>
                sortedQuestions.find(q => (q.points || 100) === points) || null
            ).filter(Boolean);
            return {
                name: category.name,
                questions: selectedQuestions
            };
        });
        return { categories: categories };
    }

    // 🎲 Array-Shuffle Funktion (Fisher-Yates Algorithm)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    setupPlayers() {
        this.players = [];
        
        if (this.gameMode === 'single') {
            const playerInputs = document.querySelectorAll('.player-name');
            playerInputs.forEach((input, index) => {
                if (input.value.trim()) {
                    this.players.push({
                        name: input.value.trim(),
                        score: 0,
                        type: 'single',
                        gameStats: {
                            questionsCorrect: 0,
                            questionsWrong: 0,
                            currentStreak: 0,
                            bestStreak: 0,
                            categoryStats: {}
                        }
                    });
                }
            });
        } else {
            const groupInputs = document.querySelectorAll('.group-name');
            const membersPerGroup = parseInt(document.getElementById('membersPerGroup').value);
            
            groupInputs.forEach((input, index) => {
                if (input.value.trim()) {
                    this.players.push({
                        name: input.value.trim(),
                        score: 0,
                        type: 'group',
                        memberCount: membersPerGroup,
                        gameStats: {
                            questionsCorrect: 0,
                            questionsWrong: 0,
                            currentStreak: 0,
                            bestStreak: 0,
                            categoryStats: {}
                        }
                    });
                }
            });
        }
    }

    showSetupScreen() {
        document.getElementById('setupScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
    }

    showGameScreen() {
        document.getElementById('setupScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
    }

    initializeBoard() {
        if (!this.gameData || !this.gameData.categories || this.gameData.categories.length === 0) {
            console.error('❌ No categories found!');
            alert('Keine Kategorien verfügbar! Bitte füge Kategorien im Editor hinzu.');
            return;
        }

        const numCategories = this.gameData.categories.length;

        // Update categories row dynamically
        const categoriesRow = document.querySelector('.categories-row');
        categoriesRow.innerHTML = '';
        categoriesRow.style.gridTemplateColumns = `repeat(${numCategories}, 1fr)`;

        // Create category headers
        this.gameData.categories.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.dataset.category = index;
            
            const categoryTitle = document.createElement('span');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category.name;
            
            categoryDiv.appendChild(categoryTitle);
            categoriesRow.appendChild(categoryDiv);
        });

        // Dynamische Schriftgröße für lange Kategorienamen
        this.adjustCategoryFontSizes();

        // Create question grid
        const questionsGrid = document.getElementById('questionsGrid');
        questionsGrid.innerHTML = '';
        questionsGrid.style.gridTemplateColumns = `repeat(${numCategories}, 1fr)`;

        // Get max questions from first category (all categories should have same amount)
        if (!this.gameData.categories[0] || !this.gameData.categories[0].questions) {
            console.error('❌ No questions found in first category!');
            return;
        }
        
        const maxQuestions = this.gameData.categories[0].questions.length;

        // Create question cards
        for (let questionIndex = 0; questionIndex < maxQuestions; questionIndex++) {
            for (let categoryIndex = 0; categoryIndex < numCategories; categoryIndex++) {
                const questionData = this.gameData.categories[categoryIndex]?.questions[questionIndex];
                if (questionData) {
                    const questionCard = document.createElement('div');
                    questionCard.className = 'question-card';
                    questionCard.dataset.category = categoryIndex;
                    questionCard.dataset.question = questionIndex;
                    
                    const pointsSpan = document.createElement('span');
                    pointsSpan.className = 'question-points';
                    pointsSpan.textContent = questionData.points;
                    
                    questionCard.appendChild(pointsSpan);
                    questionCard.addEventListener('click', () => this.selectQuestion(categoryIndex, questionIndex));
                    
                    questionsGrid.appendChild(questionCard);
                }
            }
        }

        // Update total questions count
        this.gameStats.totalQuestions = numCategories * maxQuestions;
    }

    /**
     * Passt die Schriftgröße von Kategorietiteln dynamisch an deren Länge an
     * Verhindert Textüberlauf und sorgt für professionelles Aussehen
     */
    adjustCategoryFontSizes() {
        const categoryTitles = document.querySelectorAll('.category-title');
        
        categoryTitles.forEach(title => {
            const text = title.textContent;
            const length = text.length;
            
            // Basis-Schriftgröße zurücksetzen
            title.style.fontSize = '';
            
            // Dynamische Anpassung basierend auf Textlänge
            if (length > 15) {
                // Sehr lange Wörter (z.B. "NATURWISSENSCHAFTEN")
                title.style.fontSize = 'clamp(0.75rem, 0.9vw, 1rem)';
                title.style.letterSpacing = '1px';
                title.style.lineHeight = '1.2';
            } else if (length > 12) {
                // Lange Wörter (z.B. "WISSENSCHAFT")
                title.style.fontSize = 'clamp(0.85rem, 1vw, 1.15rem)';
                title.style.letterSpacing = '1.5px';
                title.style.lineHeight = '1.3';
            } else if (length > 9) {
                // Mittlere Wörter (z.B. "GEOGRAFIE")
                title.style.fontSize = 'clamp(0.95rem, 1.1vw, 1.25rem)';
                title.style.letterSpacing = '1.8px';
            } else {
                // Kurze Wörter (z.B. "SPORT", "MUSIK")
                title.style.fontSize = 'clamp(1rem, 1.2vw, 1.4rem)';
                title.style.letterSpacing = '2px';
            }
            
            // Zusätzliche Prüfung: Wenn Text trotzdem zu breit ist
            const parent = title.closest('.category');
            if (parent) {
                const titleWidth = title.scrollWidth;
                const parentWidth = parent.clientWidth - 40; // Padding berücksichtigen
                
                if (titleWidth > parentWidth) {
                    // Text ist zu breit → weitere Verkleinerung
                    const currentSize = parseFloat(window.getComputedStyle(title).fontSize);
                    const scaleFactor = parentWidth / titleWidth;
                    const newSize = Math.max(0.7, currentSize * scaleFactor * 0.95); // Min 0.7rem
                    title.style.fontSize = `${newSize}rem`;
                }
            }
        });
    }

    updatePlayerDisplay() {
        const container = document.getElementById('playersContainer');
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.dataset.playerIndex = index;

            if (index === this.currentPlayerIndex) {
                playerCard.classList.add('current-player');
            }

            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerScore = document.createElement('div');
            playerScore.className = 'player-score';
            playerScore.textContent = `${player.score} Punkte`;

            playerCard.appendChild(playerName);
            playerCard.appendChild(playerScore);
            container.appendChild(playerCard);
        });
    }

    updateCurrentPlayer() {
        document.getElementById('currentPlayerName').textContent = this.players[this.currentPlayerIndex].name;
    }

    selectQuestion(categoryIndex, questionIndex) {
        const questionKey = `${categoryIndex}-${questionIndex}`;
        
        if (this.usedQuestions.has(questionKey)) {
            return; // Question already used
        }

        // Play click sound
        this.soundManager.play('click');

        // Add flip animation
        const questionCard = document.querySelector(`[data-category="${categoryIndex}"][data-question="${questionIndex}"]`);
        questionCard.classList.add('flip');
        
        setTimeout(() => {
            questionCard.classList.remove('flip');
        }, 600);

        const questionData = this.gameData.categories[categoryIndex].questions[questionIndex];
        const categoryName = this.gameData.categories[categoryIndex].name;

        // Check if this is a Daily Double
        if (this.dailyDoubles.has(questionKey)) {
            this.showDailyDoubleModal(categoryName, questionData, questionKey);
        } else {
            this.showQuestionModal(categoryName, questionData, questionKey, false);
        }
    }

    showAnswer() {
        document.querySelector('.modal-answer').classList.remove('hidden');
        document.getElementById('showAnswerBtn').classList.add('hidden');
        document.getElementById('answerButtons').classList.remove('hidden');
    }

    answerResult(isCorrect) {
        if (!this.currentQuestion) {
            console.error('No current question set!');
            alert('Fehler: Keine aktuelle Frage gefunden!');
            return;
        }

        this.stopTimer();
        
        const points = this.currentWager || this.currentQuestion.questionData.points;
        const currentPlayer = this.players[this.currentPlayerIndex];
        const [categoryIndex, questionIndex] = this.currentQuestion.questionKey.split('-');
        const categoryName = this.gameData.categories[categoryIndex].name;
        const questionText = this.currentQuestion.questionData.question;

        // 📊 Track question statistics
        const timeTaken = this.timerStartTime ? (Date.now() - this.timerStartTime) / 1000 : 0;
        
        if (window.questionStats) {
            window.questionStats.recordAnswer(questionText, categoryName, isCorrect, timeTaken);
        }
        
        // 📊 Track analytics
        if (window.analyticsEvents) {
            window.analyticsEvents.questionAnswered(
                categoryName,
                this.currentQuestion.questionData.points,
                isCorrect,
                timeTaken
            );
        }

        // Play sound effect
        this.soundManager.play(isCorrect ? 'correct' : 'wrong');

        // Update score
        if (isCorrect) {
            currentPlayer.score += points;
            currentPlayer.gameStats.questionsCorrect++;
            currentPlayer.gameStats.currentStreak++;
            if (currentPlayer.gameStats.currentStreak > currentPlayer.gameStats.bestStreak) {
                currentPlayer.gameStats.bestStreak = currentPlayer.gameStats.currentStreak;
            }
        } else {
            currentPlayer.score -= points;
            currentPlayer.gameStats.questionsWrong++;
            currentPlayer.gameStats.currentStreak = 0;
        }

        // Update category statistics
        if (!currentPlayer.gameStats.categoryStats[categoryName]) {
            currentPlayer.gameStats.categoryStats[categoryName] = { correct: 0, total: 0 };
        }
        currentPlayer.gameStats.categoryStats[categoryName].total++;
        if (isCorrect) {
            currentPlayer.gameStats.categoryStats[categoryName].correct++;
        }

        // Update global game stats
        this.gameStats.questionsAnswered++;

        // Show point animation
        this.showPointAnimation(points, isCorrect);

        // Mark question as used
        this.usedQuestions.add(this.currentQuestion.questionKey);
        
        // Update question card visually
        const questionCard = document.querySelector(`[data-category="${categoryIndex}"][data-question="${questionIndex}"]`);
        questionCard.classList.add('used');
        
        // Check for achievements
        this.checkAchievements(currentPlayer, isCorrect, points);
        
        // Reset wager
        this.currentWager = 0;
        
        // Close modal
        this.closeModal();
        
        // Update displays
        this.updatePlayerDisplay();
        this.updateGameStats();
        
        // Save statistics
        this.savePlayerStats();
        
        // Move to next player (only on wrong answers in standard Jeopardy)
        if (!isCorrect) {
            this.nextPlayer();
        }
        
        // Check if all questions are used
        const totalQuestions = this.gameData.categories.reduce((total, category) => 
            total + category.questions.length, 0
        );
        if (this.usedQuestions.size === totalQuestions) {
            this.showNextRoundButton();
        }
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateCurrentPlayer();
        this.updatePlayerDisplay();
    }

    showNextRoundButton() {
        document.getElementById('nextRoundBtn').classList.remove('hidden');
        
        // Event-Listener für neue Runde
        document.getElementById('nextRoundBtn').addEventListener('click', () => {
            this.startNewRound();
        });
    }

    // 🔄 Neue Runde mit neuen zufälligen Fragen
    startNewRound() {
        // Reset used questions
        this.usedQuestions.clear();
        
        // Lade neue zufällige Fragen (durch filterQuestionsByDifficulty)
        this.gameData = this.filterQuestionsByDifficulty();
        
        // Rebuild board with new questions
        this.initializeBoard();
        
        // Setup new Daily Doubles
        if (this.dailyDoublesEnabled) {
            this.dailyDoubles.clear();
            this.setupDailyDoubles();
        }
        
        // Hide next round button
        document.getElementById('nextRoundBtn').classList.add('hidden');
        
        // Update game stats
        this.gameStats.questionsAnswered = 0;
        this.updateGameStats();
        
        // Show success message
        this.showNotification('🎲 Neue Runde mit frischen Fragen gestartet!', 'success');
        
        // Play sound
        this.soundManager.play('theme');
    }

    // 📢 Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="close-notification">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
        
        return notification;
    }

    nextRound() {
        if (this.round >= this.maxRounds) {
            this.endGame();
        } else {
            this.round++;
            // For multiple rounds, you could implement Double Jeopardy here
            this.endGame(); // For now, end after one round
        }
    }

    endGame() {
        // Calculate winner
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];
        const hasWinner = sortedPlayers[0].score > sortedPlayers[1].score;

        // Update persistent statistics
        this.updatePersistentStats();
        
        // Start confetti animation
        if (hasWinner) {
            this.startConfetti();
        }

        this.showWinnerModal(sortedPlayers, winner, hasWinner);
    }

    showWinnerModal(sortedPlayers, winner, hasWinner) {
        const finalResults = document.getElementById('finalResults');
        finalResults.innerHTML = '';

        // Show all results
        sortedPlayers.forEach((player, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            if (index === 0 && hasWinner) {
                resultItem.classList.add('winner');
            }

            resultItem.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <span>${player.score} Punkte</span>
            `;
            
            finalResults.appendChild(resultItem);
        });

        // Winner announcement
        const winnerAnnouncement = document.getElementById('winnerAnnouncement');
        if (hasWinner) {
            winnerAnnouncement.textContent = `🎉 ${winner.name} gewinnt mit ${winner.score} Punkten! 🎉`;
        } else {
            winnerAnnouncement.textContent = `🤝 Unentschieden! Mehrere Spieler haben ${winner.score} Punkte! 🤝`;
        }

        // Show game statistics summary
        this.showGameStatsSummary();

        // Show winner modal
        document.getElementById('winnerModal').classList.remove('hidden');
    }

    closeModal() {
        this.stopTimer();
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    newGame() {
        // Reset ALL game state
        this.players = [];
        this.currentPlayerIndex = 0;
        this.usedQuestions.clear();
        this.usedQuestionsPerDifficulty = {}; // Reset difficulty-specific question tracking
        this.round = 1;
        this.gameData = null;
        this.dailyDoubles.clear();
        this.currentWager = 0;

        // Reset statistics for new game
        this.gameStats = {
            questionsAnswered: 0,
            totalQuestions: 25,
            gameStartTime: null,
            streaks: {},
            categoryStats: {}
        };

        // Close modal and go back to setup
        this.closeModal();
        this.showSetupScreen();
        
        // Reset setup form visibility
        document.getElementById('playerSetup').classList.add('hidden');
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show success notification
        this.showNotification('🎮 Neues Spiel bereit! Wähle Spielmodus und Spieler.', 'success');
    }

    backToSetup() {
        // Reset everything
        this.players = [];
        this.currentPlayerIndex = 0;
        this.usedQuestions.clear();
        this.gameMode = null;
        this.round = 1;

        // Close modal and show setup
        this.closeModal();
        this.showSetupScreen();
        
        // Reset setup form
        document.getElementById('playerSetup').classList.add('hidden');
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // Statistics and Achievements Methods
    initializePlayerGameStats() {
        this.players.forEach(player => {
            this.gameData.categories.forEach(category => {
                player.gameStats.categoryStats[category.name] = { correct: 0, total: 0 };
            });
        });
    }

    updateGameStats() {
        document.getElementById('questionsAnswered').textContent = this.gameStats.questionsAnswered;
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        document.getElementById('currentStreak').textContent = currentPlayer.gameStats.currentStreak;
    }

    showPointAnimation(points, isCorrect) {
        const container = document.getElementById('pointAnimationContainer');
        const animation = document.createElement('div');
        animation.className = 'point-animation';
        
        if (!isCorrect) {
            animation.classList.add('negative');
            animation.textContent = `-${points}`;
        } else {
            animation.textContent = `+${points}`;
        }

        // Position animation near current player
        const playerCards = document.querySelectorAll('.player-card');
        const currentPlayerCard = playerCards[this.currentPlayerIndex];
        const rect = currentPlayerCard.getBoundingClientRect();
        
        animation.style.left = (rect.left + rect.width / 2) + 'px';
        animation.style.top = rect.top + 'px';

        container.appendChild(animation);

        // Remove after animation
        setTimeout(() => {
            container.removeChild(animation);
        }, 2000);

        // Add score animation to player card
        const scoreElement = currentPlayerCard.querySelector('.player-score');
        scoreElement.classList.add(isCorrect ? 'score-increase' : 'score-decrease');
        setTimeout(() => {
            scoreElement.classList.remove('score-increase', 'score-decrease');
        }, 600);
    }

    checkAchievements(player, isCorrect, points) {
        if (isCorrect) {
            // First correct answer
            if (player.gameStats.questionsCorrect === 1) {
                this.showAchievement('Erster Treffer!', 'Du hast deine erste Frage richtig beantwortet!');
            }
            
            // Streak achievements
            if (player.gameStats.currentStreak === 3) {
                this.showAchievement('Auf dem Vormarsch!', '3 richtige Antworten in Folge!');
            } else if (player.gameStats.currentStreak === 5) {
                this.showAchievement('Heißer Lauf!', '5 richtige Antworten in Folge!');
            } else if (player.gameStats.currentStreak === 10) {
                this.showAchievement('Unaufhaltsam!', '10 richtige Antworten in Folge!');
            }

            // High-value question
            if (points === 500) {
                this.showAchievement('Mutiger Zug!', 'Du hast eine 500-Punkte-Frage richtig beantwortet!');
            }

            // Perfect category
            const categoryName = Object.keys(player.gameStats.categoryStats).find(cat => {
                const stats = player.gameStats.categoryStats[cat];
                return stats.total === 5 && stats.correct === 5;
            });
            if (categoryName) {
                this.showAchievement('Kategorie-Meister!', `Perfekt in ${categoryName}!`);
            }
        }
    }

    showAchievement(title, description) {
        const container = document.getElementById('achievementContainer');
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        notification.innerHTML = `
            <div class="achievement-title">🏆 ${title}</div>
            <div class="achievement-description">${description}</div>
        `;

        container.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 4000);
    }

    startConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';

        // Create 50 confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }

        // Stop confetti after 6 seconds
        setTimeout(() => {
            container.innerHTML = '';
        }, 6000);
    }

    showStatistics() {
        const container = document.getElementById('playerStatsContainer');
        container.innerHTML = '';

        this.players.forEach(player => {
            const statsCard = this.createPlayerStatsCard(player);
            container.appendChild(statsCard);
        });

        document.getElementById('statisticsModal').classList.remove('hidden');
    }

    createPlayerStatsCard(player) {
        const card = document.createElement('div');
        card.className = 'player-stat-card';

        const totalQuestions = player.gameStats.questionsCorrect + player.gameStats.questionsWrong;
        const accuracy = totalQuestions > 0 ? Math.round((player.gameStats.questionsCorrect / totalQuestions) * 100) : 0;

        card.innerHTML = `
            <div class="player-stat-header">
                <div class="player-stat-name">${player.name}</div>
                <div class="player-stat-score">${player.score} Punkte</div>
            </div>
            <div class="stat-grid">
                <div class="stat-box">
                    <span class="stat-value">${player.gameStats.questionsCorrect}</span>
                    <div class="stat-label">Richtige Antworten</div>
                </div>
                <div class="stat-box">
                    <span class="stat-value">${player.gameStats.questionsWrong}</span>
                    <div class="stat-label">Falsche Antworten</div>
                </div>
                <div class="stat-box">
                    <span class="stat-value">${accuracy}%</span>
                    <div class="stat-label">Genauigkeit</div>
                </div>
                <div class="stat-box">
                    <span class="stat-value">${player.gameStats.bestStreak}</span>
                    <div class="stat-label">Beste Serie</div>
                </div>
            </div>
            <div class="category-strengths">
                <h4 style="color: #e0aaff; margin-bottom: 10px;">Kategorien-Stärken</h4>
                ${this.createCategoryStrengthBars(player.gameStats.categoryStats)}
            </div>
        `;

        return card;
    }

    createCategoryStrengthBars(categoryStats) {
        return Object.keys(categoryStats).map(category => {
            const stats = categoryStats[category];
            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            
            return `
                <div class="strength-bar">
                    <div class="strength-label">${category}</div>
                    <div class="strength-progress">
                        <div class="strength-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="strength-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');
    }

    showGameStatsSummary() {
        const container = document.getElementById('gameStatsSummary');
        const gameTime = this.gameStats.gameStartTime ? 
            Math.round((new Date() - this.gameStats.gameStartTime) / 1000 / 60) : 0;
        
        const totalCorrect = this.players.reduce((sum, p) => sum + p.gameStats.questionsCorrect, 0);
        const totalWrong = this.players.reduce((sum, p) => sum + p.gameStats.questionsWrong, 0);
        const bestStreak = Math.max(...this.players.map(p => p.gameStats.bestStreak));

        container.innerHTML = `
            <h3>Spielzusammenfassung</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${gameTime} Min</div>
                    <div class="summary-label">Spieldauer</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalCorrect}</div>
                    <div class="summary-label">Richtige Antworten</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${bestStreak}</div>
                    <div class="summary-label">Längste Serie</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)}%</div>
                    <div class="summary-label">Gesamt-Genauigkeit</div>
                </div>
            </div>
        `;
    }

    loadPlayerStats() {
        // Load persistent player statistics from localStorage
        this.persistentStats = JSON.parse(localStorage.getItem('jeopardyPlayerStats') || '{}');
    }

    savePlayerStats() {
        // Save current game stats to persistent storage
        this.players.forEach(player => {
            if (!this.persistentStats[player.name]) {
                this.persistentStats[player.name] = {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalScore: 0,
                    bestScore: 0,
                    totalCorrect: 0,
                    totalWrong: 0,
                    bestStreak: 0
                };
            }
        });

        localStorage.setItem('jeopardyPlayerStats', JSON.stringify(this.persistentStats));
    }

    updatePersistentStats() {
        // Update persistent statistics at game end
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];

        this.players.forEach(player => {
            const stats = this.persistentStats[player.name];
            stats.gamesPlayed++;
            stats.totalScore += player.score;
            if (player.score > stats.bestScore) {
                stats.bestScore = player.score;
            }
            stats.totalCorrect += player.gameStats.questionsCorrect;
            stats.totalWrong += player.gameStats.questionsWrong;
            if (player.gameStats.bestStreak > stats.bestStreak) {
                stats.bestStreak = player.gameStats.bestStreak;
            }
            if (player === winner) {
                stats.gamesWon++;
            }
        });

        this.savePlayerStats();
    }

    resetStatistics() {
        if (confirm('Möchtest du wirklich alle gespeicherten Statistiken zurücksetzen?')) {
            localStorage.removeItem('jeopardyPlayerStats');
            this.persistentStats = {};
            this.showStatistics();
        }
    }

    // Theme System Methods
    changeTheme(themeName) {
        // Remove old theme classes
        document.body.classList.remove('theme-purple-blue', 'theme-ocean-blue', 'theme-green-silver', 'theme-dark-mode');
        
        // Add new theme class
        if (themeName !== 'purple-blue') {
            document.body.classList.add(`theme-${themeName}`);
        }
        
        this.currentTheme = themeName;
        
        // Save theme preference
        localStorage.setItem('jeopardyTheme', themeName);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('jeopardyTheme') || 'purple-blue';
        document.getElementById('themeSelect').value = savedTheme;
        this.changeTheme(savedTheme);
    }

    // Daily Doubles Methods
    setupDailyDoubles() {
        this.dailyDoubles.clear();
        
        // Add 2-3 random Daily Doubles (excluding 100-point questions)
        const availableQuestions = [];
        for (let cat = 0; cat < 5; cat++) {
            for (let q = 1; q < 5; q++) { // Skip 100-point questions (index 0)
                availableQuestions.push(`${cat}-${q}`);
            }
        }
        
        // Shuffle and select 3 Daily Doubles
        for (let i = 0; i < 3; i++) {
            if (availableQuestions.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableQuestions.length);
                const questionKey = availableQuestions.splice(randomIndex, 1)[0];
                this.dailyDoubles.add(questionKey);
                
                // Mark the card visually
                const [cat, q] = questionKey.split('-');
                const questionCard = document.querySelector(`[data-category="${cat}"][data-question="${q}"]`);
                if (questionCard) {
                    questionCard.classList.add('daily-double');
                }
            }
        }
    }

    showDailyDoubleModal(categoryName, questionData, questionKey) {
        // Play Daily Double sound
        this.soundManager.play('dailyDouble');
        
        document.getElementById('ddCategory').textContent = categoryName;
        const currentScore = this.players[this.currentPlayerIndex].score;
        document.getElementById('ddCurrentScore').textContent = currentScore;
        
        // Set max wager to player's current score (or 100 minimum if they have less)
        const maxWager = Math.max(currentScore, 100);
        const minWager = 100;
        
        const wagerInput = document.getElementById('wagerAmount');
        wagerInput.min = minWager;
        wagerInput.max = maxWager;
        wagerInput.value = Math.min(500, maxWager);
        
        // Store current question for later
        this.currentQuestion = { questionData, questionKey };
        
        // Show modal
        document.getElementById('dailyDoubleModal').classList.remove('hidden');
    }

    selectWager(button) {
        // Remove active class from all buttons
        document.querySelectorAll('.wager-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Set wager amount
        const amount = button.dataset.amount;
        if (amount) {
            document.getElementById('wagerAmount').value = amount;
        }
    }

    selectAllIn() {
        const currentScore = this.players[this.currentPlayerIndex].score;
        const allInAmount = Math.max(currentScore, 100); // Max = aktueller Score
        
        document.getElementById('wagerAmount').value = allInAmount;
        
        // Mark All In button as active
        document.querySelectorAll('.wager-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('allInBtn').classList.add('active');
    }

    confirmWager() {
        const wagerAmount = parseInt(document.getElementById('wagerAmount').value);
        const currentScore = this.players[this.currentPlayerIndex].score;
        const maxWager = Math.max(currentScore, 100); // Max = aktueller Score
        const minWager = 100;
        
        // Validate wager
        if (isNaN(wagerAmount) || wagerAmount < minWager || wagerAmount > maxWager) {
            alert(`Einsatz muss zwischen ${minWager} und ${maxWager} liegen!`);
            return;
        }
        
        // Set the wager
        this.currentWager = wagerAmount;
        
        // Close Daily Double modal and show question
        document.getElementById('dailyDoubleModal').classList.add('hidden');
        
        const categoryName = document.getElementById('ddCategory').textContent;
        this.showQuestionModal(categoryName, this.currentQuestion.questionData, this.currentQuestion.questionKey, true);
    }

    showQuestionModal(categoryName, questionData, questionKey, isDailyDouble = false) {
        document.getElementById('modalCategory').textContent = categoryName;
        
        if (isDailyDouble) {
            document.getElementById('modalPoints').textContent = `DD: ${this.currentWager}`;
            document.getElementById('modalPoints').style.color = '#ffd700';
        } else {
            document.getElementById('modalPoints').textContent = questionData.points;
            document.getElementById('modalPoints').style.color = '';
        }
        
        document.getElementById('modalQuestion').textContent = questionData.question;
        document.getElementById('modalAnswerText').textContent = questionData.answer;

        // Reset modal state
        document.querySelector('.modal-answer').classList.add('hidden');
        document.getElementById('showAnswerBtn').classList.remove('hidden');
        document.getElementById('answerButtons').classList.add('hidden');

        // Store current question data
        this.currentQuestion = { questionData, questionKey };

        // Show modal
        document.getElementById('questionModal').classList.remove('hidden');
        
        // Start timer if enabled
        if (this.timerEnabled && !isDailyDouble) {
            this.startTimer();
        }
    }

    // Timer System Methods
    startTimer() {
        this.timeLeft = this.timerDuration; // Use configured duration
        document.getElementById('timerRing').classList.remove('hidden');
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timerText');
        const timerCircle = document.getElementById('timerCircle');
        
        timerText.textContent = this.timeLeft;
        
        // Calculate progress based on configured duration
        const progress = (this.timeLeft / this.timerDuration) * 283;
        timerCircle.style.strokeDashoffset = 283 - progress;
        
        // Change colors based on percentage of time left
        const percentLeft = (this.timeLeft / this.timerDuration) * 100;
        timerCircle.classList.remove('warning', 'danger');
        if (percentLeft <= 16.7) { // Last 1/6 of time
            timerCircle.classList.add('danger');
        } else if (percentLeft <= 33.3) { // Last 1/3 of time
            timerCircle.classList.add('warning');
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('timerRing').classList.add('hidden');
    }

    timeUp() {
        this.stopTimer();
        this.soundManager.play('wrong');
        
        // Auto-submit as wrong answer
        setTimeout(() => {
            this.answerResult(false);
        }, 500);
    }

    // Quick Actions Methods
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseOverlay = document.getElementById('pauseOverlay');
        
        if (this.isPaused) {
            pauseOverlay.classList.remove('hidden');
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
        } else {
            pauseOverlay.classList.add('hidden');
            if (this.timerEnabled && this.timeLeft > 0 && !document.getElementById('timerRing').classList.contains('hidden')) {
                this.resumeTimer();
            }
        }
    }

    resumeTimer() {
        if (this.timeLeft > 0) {
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    this.timeUp();
                }
            }, 1000);
        }
    }

    toggleFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (!document.fullscreenElement) {
            // Vollbild aktivieren
            document.documentElement.requestFullscreen().catch(err => {
                console.error('❌ Fullscreen error:', err);
                this.showToast('Vollbild konnte nicht aktiviert werden', 'error');
            });
            
            // Button-Text aktualisieren
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '🔲';
                fullscreenBtn.title = 'Vollbild verlassen';
            }
        } else {
            // Vollbild verlassen
            document.exitFullscreen();
            
            // Button-Text aktualisieren
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '🔳';
                fullscreenBtn.title = 'Vollbild';
            }
        }
    }

    showHelp() {
        document.getElementById('helpModal').classList.remove('hidden');
    }

    showRules() {
        document.getElementById('rulesModal').classList.remove('hidden');
    }

    // Keyboard Shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.isPaused) return;
            
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                case 'space':
                    e.preventDefault();
                    if (!document.getElementById('questionModal').classList.contains('hidden')) {
                        if (!document.getElementById('showAnswerBtn').classList.contains('hidden')) {
                            this.showAnswer();
                        }
                    }
                    break;
                case 'r':
                    if (!document.getElementById('answerButtons').classList.contains('hidden')) {
                        this.answerResult(true);
                    }
                    break;
                case 'f':
                    if (!document.getElementById('answerButtons').classList.contains('hidden')) {
                        this.answerResult(false);
                    }
                    break;
                case 'escape':
                    this.closeModal();
                    break;
                case 's':
                    if (!document.getElementById('gameScreen').classList.contains('hidden')) {
                        this.showStatistics();
                    }
                    break;
                case 'p':
                    if (!document.getElementById('gameScreen').classList.contains('hidden')) {
                        this.togglePause();
                    }
                    break;
                case 'h':
                    this.showHelp();
                    break;
            }
        });
    }

    // Enhanced Modal Closing is now handled by the main closeModal function above

    // Sound System Methods
    addClickSounds() {
        // Add click sounds to buttons
        document.querySelectorAll('button, .question-card, .mode-btn').forEach(element => {
            element.addEventListener('click', () => {
                if (!element.classList.contains('used')) {
                    this.soundManager.play('click');
                }
            });
        });
    }

    // Mobile Optimization Methods
    addTouchSupport() {
        // Add touch event listeners for better mobile experience
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleGesture();
        });
        
        const handleGesture = () => {
            const swipeThreshold = 100;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe up - could show statistics
                    if (document.getElementById('gameScreen').classList.contains('hidden')) return;
                    this.showStatistics();
                } else {
                    // Swipe down - could close modals
                    this.closeModal();
                }
            }
        };
        
        this.handleGesture = handleGesture;
    }
    
    // ===================================
    // ANALYTICS SYSTEM INITIALISIEREN   
    // ===================================
    initializeAnalytics() {
        // Analytics Toggle
        const analyticsToggle = document.getElementById('analyticsToggle');
        if (analyticsToggle && window.analyticsManager) {
            // Lade aktuellen Status
            analyticsToggle.checked = window.analyticsManager.isEnabled();
            
            // Event Listener
            analyticsToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    window.analyticsManager.enable();
                    console.log('✅ Analytics aktiviert');
                } else {
                    window.analyticsManager.disable();
                    console.log('❌ Analytics deaktiviert');
                }
            });
        }
        
        // Analytics Dashboard Button (nur für Admins)
        const analyticsBtn = document.getElementById('openAnalyticsBtn');
        if (analyticsBtn && window.analyticsDashboard) {
            analyticsBtn.addEventListener('click', () => {
                window.analyticsDashboard.open();
                if (window.analyticsEvents) {
                    window.analyticsEvents.buttonClicked('openAnalyticsBtn', 'setup_screen');
                }
            });
        }
        
        // Track Page Load
        if (window.analyticsEvents) {
            const loadTime = performance.now();
            window.analyticsEvents.pageLoadTime(loadTime);
            window.analyticsEvents.screenViewed('setup_screen');
        }
    }
    
    // ===================================
    // DEBUG-KONTROLLEN INITIALISIEREN   
    // ===================================
    initializeDebugControls() {
        // 🔧 Debug-Tastenkürzel hinzufügen
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + D = Debug-Modus umschalten
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                console.log('🔧 Debug-Toggle nicht verfügbar');
            }
            
            // Ctrl + Shift + P = Performance-Monitor
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                if (window.performanceMonitor) {
                    if (DEBUG_CONFIG.showFPS) {
                        performanceMonitor.stopMonitoring();
                        DEBUG_CONFIG.showFPS = false;
                    } else {
                        performanceMonitor.startMonitoring();
                        DEBUG_CONFIG.showFPS = true;
                    }
                }
            }
            
            // Ctrl + Shift + S = Statistiken anzeigen
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                console.log('📊 Statistiken-Anzeige nicht verfügbar');
            }
        });
        
        // 🎯 Debug-Info in Konsole
        if (DEBUG_CONFIG.enabled) {
            console.log(`
🔧 DEBUG-TASTENKÜRZEL 🔧
─────────────────────────
Strg + Shift + D → Debug-Modus umschalten
Strg + Shift + P → Performance-Monitor
Strg + Shift + S → Statistiken anzeigen
─────────────────────────
            `);
        }
    }

    // Initialize all systems
    init() {
        this.bindEventListeners();
        this.showSetupScreen();
        this.loadTheme();
        this.addTouchSupport();
        
        // Play welcome sound
        setTimeout(() => {
            this.soundManager.play('theme');
        }, 500);
    }
    
    // ===================================
    // PERFORMANCE-OPTIMIERTE EVENT HANDLER
    // ===================================
    
    handleGlobalClick(e) {
        // Event delegation für Performance-Optimierung
        const target = e.target;
        const id = target.id;
        
        // Null-Check für Sicherheit
        if (!id) return;
        
        // Performance: Verwende switch statt if-chains
        switch(id) {
            case 'pauseGameBtn': this.togglePause(); break;
            case 'fullscreenBtn': this.toggleFullscreen(); break;
            case 'helpBtn': this.showHelp(); break;
            case 'showRulesBtn': this.showRules(); break;
            case 'closeHelpBtn': this.closeModal(); break;
            case 'closeRulesBtn': this.closeModal(); break;
            case 'closeRulesBtn2': this.closeModal(); break;
            case 'resumeGameBtn': this.togglePause(); break;
            case 'nextRoundBtn': this.nextRound(); break;
            case 'endGameBtn': this.endGame(); break;
            case 'showAnswerBtn': this.showAnswer(); break;
            case 'correctBtn': this.answerResult(true); break;
            case 'wrongBtn': this.answerResult(false); break;
            case 'newGameBtn': this.newGame(); break;
            case 'backToSetupBtn': this.backToSetup(); break;
            case 'showStatsBtn': this.showStatistics(); break;
            case 'closeStatsBtn': this.closeModal(); break;
            case 'resetStatsBtn': this.resetStatistics(); break;
        }
    }
    
    handleGlobalChange(e) {
        // Event delegation für Change-Events
        const target = e.target;
        const id = target.id;
        
        if (!id) return;
        
        switch(id) {
            case 'themeSelect': this.changeTheme(target.value); break;
            case 'soundToggle': this.soundManager.setEnabled(target.checked); break;
            case 'dailyDoublesToggle': this.dailyDoublesEnabled = target.checked; break;
            case 'animationToggle': 
                this.animationsEnabled = target.checked;
                document.body.classList.toggle('no-animations', !target.checked);
                break;
            case 'timerToggle': 
                this.timerEnabled = target.checked;
                this.toggleTimerConfig(target.checked);
                break;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new JeopardyGame();
});