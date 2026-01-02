/*
    ╔══════════════════════════════════════════════════════╗
    ║  🕐 TIMER & CLOCK - JavaScript Logic                ║
    ║  Digitale Uhr mit Timer & Alarm-Funktionen          ║
    ║                                                      ║
    ║  Entwickler: Nico Kaschube                          ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025   ║
    ╚══════════════════════════════════════════════════════╝
*/

// ==================== TIMER MANAGER ====================
class TimerManager {
    constructor() {
        this.mode = 'clock'; // 'clock' or 'timer'
        this.isRunning = false;
        this.isPaused = false;
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.clockInterval = null;
        this.timerInterval = null;
        this.showSeconds = true;
        this.use24h = true;
        this.currentTheme = 'default';
        this.alarmSound = 'beep';
        this.volume = 0.7;
        this.audioContext = null;
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.startClock();
        this.updateClock(); // Fallback: Zeigt sofort die aktuelle Uhrzeit beim Laden
        this.loadSettings();
        console.log('🕐 Timer Manager initialisiert');
    }

    bindElements() {
        // Display elements
        this.clockDisplay = document.getElementById('clockDisplay');
        this.clockMode = document.getElementById('clockMode');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.dateDisplay = document.getElementById('dateDisplay');
        this.statusMessage = document.getElementById('statusMessage');
        this.timerProgress = document.getElementById('timerProgress');
        this.progressBar = document.getElementById('progressBar');

        // Control elements
        this.modeBtn = document.getElementById('modeBtn');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.testAlarmBtn = document.getElementById('testAlarmBtn');

        // Input elements
        this.timerInputs = document.getElementById('timerInputs');
        this.hoursInput = document.getElementById('hoursInput');
        this.minutesInput = document.getElementById('minutesInput');
        this.secondsInput = document.getElementById('secondsInput');

        // Settings elements
        this.themeSelect = document.getElementById('themeSelect');
        this.alarmSelect = document.getElementById('alarmSelect');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeLabel = document.getElementById('volumeLabel');
        this.showSecondsCheck = document.getElementById('showSecondsCheck');
        this.show24hCheck = document.getElementById('show24hCheck');
    }

    bindEvents() {
        // Mode switching
        this.modeBtn.addEventListener('click', () => this.toggleMode());
        
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Other controls
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.testAlarmBtn.addEventListener('click', () => this.playAlarm());
        
        // Settings
        this.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        this.alarmSelect.addEventListener('change', (e) => this.alarmSound = e.target.value);
        this.volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            this.volumeLabel.textContent = `${e.target.value}%`;
        });
        this.showSecondsCheck.addEventListener('change', (e) => {
            this.showSeconds = e.target.checked;
        });
        this.show24hCheck.addEventListener('change', (e) => {
            this.use24h = e.target.checked;
        });
    }

    // =========================================================================
    // CLOCK MODE
    // =========================================================================
    
    startClock() {
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        
        // Time
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        let timeString = '';
        if (this.use24h) {
            timeString = `${this.pad(hours)}:${this.pad(minutes)}`;
        } else {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            timeString = `${this.pad(hours)}:${this.pad(minutes)} ${ampm}`;
        }
        
        if (this.showSeconds) {
            timeString = this.use24h 
                ? `${this.pad(now.getHours())}:${this.pad(minutes)}:${this.pad(seconds)}`
                : `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)} ${timeString.includes('PM') ? 'PM' : 'AM'}`;
        }
        
        this.timeDisplay.textContent = timeString;
        
        // Date
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();
        
        this.dateDisplay.textContent = `${dayName}, ${day}. ${monthName} ${year}`;
    }

    stopClock() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

    // =========================================================================
    // TIMER MODE
    // =========================================================================
    
    toggleMode() {
        if (this.mode === 'clock') {
            this.switchToTimerMode();
        } else {
            this.switchToClockMode();
        }
    }

    switchToTimerMode() {
        this.mode = 'timer';
        this.stopClock();
        
        this.clockMode.textContent = 'COUNTDOWN TIMER';
        this.modeBtn.textContent = '🕐 Uhr-Modus';
        this.modeBtn.style.display = 'inline-flex';
        
        this.timerInputs.style.display = 'flex';
        this.startBtn.style.display = 'inline-flex';
        this.dateDisplay.style.display = 'none';
        this.timerProgress.style.display = 'block';
        
        this.resetTimer();
        console.log('⏱️ Timer-Modus aktiviert');
    }

    switchToClockMode() {
        this.mode = 'clock';
        this.stopTimer();
        
        this.clockMode.textContent = 'AKTUELLE UHRZEIT';
        this.modeBtn.textContent = '⏱️ Timer-Modus';
        
        this.timerInputs.style.display = 'none';
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'none';
        this.stopBtn.style.display = 'none';
        this.dateDisplay.style.display = 'block';
        this.timerProgress.style.display = 'none';
        this.statusMessage.style.display = 'none';
        
        this.startClock();
        console.log('🕐 Uhr-Modus aktiviert');
    }

    startTimer() {
        if (this.isRunning && !this.isPaused) return;
        
        if (!this.isPaused) {
            // New timer start
            const hours = parseInt(this.hoursInput.value) || 0;
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            
            this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
            this.remainingSeconds = this.totalSeconds;
            
            if (this.totalSeconds === 0) {
                this.showStatus('Bitte Zeit eingeben!', false);
                return;
            }
        }
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-flex';
        this.stopBtn.style.display = 'inline-flex';
        this.timerInputs.style.display = 'none';
        
        this.showStatus('Timer läuft...', false);
        
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        console.log(`⏱️ Timer gestartet: ${this.formatTime(this.remainingSeconds)}`);
    }

    updateTimer() {
        if (this.remainingSeconds <= 0) {
            this.timerFinished();
            return;
        }
        
        this.remainingSeconds--;
        this.timeDisplay.textContent = this.formatTime(this.remainingSeconds);
        
        // Update progress bar
        const progress = (this.remainingSeconds / this.totalSeconds) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Warning when less than 10 seconds
        if (this.remainingSeconds === 10) {
            this.showStatus('⚠️ Nur noch 10 Sekunden!', false);
        }
    }

    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        this.isRunning = false;
        
        clearInterval(this.timerInterval);
        
        this.startBtn.textContent = '▶️ Fortsetzen';
        this.startBtn.style.display = 'inline-flex';
        this.pauseBtn.style.display = 'none';
        
        this.showStatus('⏸️ Timer pausiert', false);
        console.log('⏸️ Timer pausiert');
    }

    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        
        clearInterval(this.timerInterval);
        
        this.resetTimer();
        console.log('⏹️ Timer gestoppt');
    }

    resetTimer() {
        this.remainingSeconds = 0;
        this.timeDisplay.textContent = '00:00:00';
        this.progressBar.style.width = '100%';
        
        this.startBtn.textContent = '▶️ Start';
        this.startBtn.style.display = 'inline-flex';
        this.pauseBtn.style.display = 'none';
        this.stopBtn.style.display = 'none';
        this.timerInputs.style.display = 'flex';
        
        this.statusMessage.style.display = 'none';
    }

    timerFinished() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        this.timeDisplay.textContent = '00:00:00';
        this.progressBar.style.width = '0%';
        
        this.showStatus('🔔 ZEIT ABGELAUFEN!', true);
        this.playAlarm();
        
        // Reset controls
        this.startBtn.style.display = 'inline-flex';
        this.pauseBtn.style.display = 'none';
        this.stopBtn.style.display = 'none';
        this.timerInputs.style.display = 'flex';
        
        console.log('🔔 Timer abgelaufen!');
    }

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    pad(num) {
        return num.toString().padStart(2, '0');
    }

    showStatus(message, isAlarm) {
        this.statusMessage.textContent = message;
        this.statusMessage.style.display = 'block';
        this.statusMessage.classList.toggle('alarm', isAlarm);
    }

    reset() {
        if (this.mode === 'timer') {
            this.stopTimer();
        } else {
            this.updateClock();
        }
    }

    // =========================================================================
    // THEMES
    // =========================================================================
    
    changeTheme(theme) {
        this.currentTheme = theme;
        const root = document.documentElement;
        
        const themes = {
            default: {
                primary: '#e0aaff',
                secondary: '#c77dff',
                accent: '#9d4edd'
            },
            blue: {
                primary: '#89CFF0',
                secondary: '#4A90E2',
                accent: '#2E5C8A'
            },
            green: {
                primary: '#90EE90',
                secondary: '#4CAF50',
                accent: '#2E7D32'
            },
            red: {
                primary: '#FF6B6B',
                secondary: '#EE5A6F',
                accent: '#C92A2A'
            },
            gold: {
                primary: '#FFD700',
                secondary: '#FFA500',
                accent: '#FF8C00'
            },
            dark: {
                primary: '#FFFFFF',
                secondary: '#CCCCCC',
                accent: '#888888'
            }
        };
        
        const selectedTheme = themes[theme] || themes.default;
        
        root.style.setProperty('--text-primary', selectedTheme.primary);
        root.style.setProperty('--text-secondary', selectedTheme.secondary);
        root.style.setProperty('--accent', selectedTheme.accent);
        
        this.saveSettings();
        console.log(`🎨 Theme geändert: ${theme}`);
    }

    // =========================================================================
    // AUDIO / ALARM
    // =========================================================================
    
    playAlarm() {
        if (this.alarmSound === 'none') return;
        
        // Initialize AudioContext on first user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.playAlarmSound(this.alarmSound);
    }

    playAlarmSound(soundType) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        switch(soundType) {
            case 'beep':
                this.playBeep(ctx, now, 800, 0.3);
                setTimeout(() => this.playBeep(ctx, now + 0.3, 800, 0.3), 300);
                setTimeout(() => this.playBeep(ctx, now + 0.6, 800, 0.3), 600);
                break;
                
            case 'bell':
                this.playBell(ctx, now);
                break;
                
            case 'chime':
                this.playChime(ctx, now);
                break;
                
            case 'digital':
                this.playDigitalAlarm(ctx, now);
                break;
                
            case 'classic':
                this.playClassicAlarm(ctx, now);
                break;
        }
        
        console.log(`🔊 Alarm abgespielt: ${soundType}`);
    }

    playBeep(ctx, time, freq, duration) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }

    playBell(ctx, time) {
        for (let i = 0; i < 3; i++) {
            this.playBeep(ctx, time + (i * 0.5), 880, 0.4);
        }
    }

    playChime(ctx, time) {
        const notes = [523.25, 659.25, 783.99]; // C, E, G
        notes.forEach((freq, i) => {
            this.playBeep(ctx, time + (i * 0.3), freq, 0.5);
        });
    }

    playDigitalAlarm(ctx, time) {
        for (let i = 0; i < 6; i++) {
            const freq = i % 2 === 0 ? 1000 : 800;
            this.playBeep(ctx, time + (i * 0.2), freq, 0.15);
        }
    }

    playClassicAlarm(ctx, time) {
        for (let i = 0; i < 4; i++) {
            this.playBeep(ctx, time + (i * 0.5), 1200, 0.3);
            this.playBeep(ctx, time + (i * 0.5) + 0.15, 1000, 0.3);
        }
    }

    // =========================================================================
    // FULLSCREEN
    // =========================================================================
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.fullscreenBtn.textContent = '⛶ Vollbild beenden';
            document.body.classList.add('fullscreen-mode');
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.textContent = '⛶ Vollbild';
            document.body.classList.remove('fullscreen-mode');
        }
    }

    // =========================================================================
    // SETTINGS PERSISTENCE
    // =========================================================================
    
    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            alarmSound: this.alarmSound,
            volume: this.volume,
            showSeconds: this.showSeconds,
            use24h: this.use24h
        };
        localStorage.setItem('timerSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('timerSettings');
        if (!saved) return;
        
        try {
            const settings = JSON.parse(saved);
            
            if (settings.theme) {
                this.themeSelect.value = settings.theme;
                this.changeTheme(settings.theme);
            }
            
            if (settings.alarmSound) {
                this.alarmSelect.value = settings.alarmSound;
                this.alarmSound = settings.alarmSound;
            }
            
            if (settings.volume !== undefined) {
                this.volume = settings.volume;
                this.volumeSlider.value = settings.volume * 100;
                this.volumeLabel.textContent = `${Math.round(settings.volume * 100)}%`;
            }
            
            if (settings.showSeconds !== undefined) {
                this.showSeconds = settings.showSeconds;
                this.showSecondsCheck.checked = settings.showSeconds;
            }
            
            if (settings.use24h !== undefined) {
                this.use24h = settings.use24h;
                this.show24hCheck.checked = settings.use24h;
            }
            
            console.log('⚙️ Einstellungen geladen');
        } catch (e) {
            console.error('Fehler beim Laden der Einstellungen:', e);
        }
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🕐 Timer-App wird initialisiert...');
    window.timerManager = new TimerManager();
    console.log('✅ Timer-App bereit!');
});
