/*
╔═══════════════════════════════════════════════════╗
║  🎯 AUFGABEN-ROULETTE - LOGIK                    ║
║  Faire Verteilung mit Verlaufs-Tracking          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
*/

class TaskRoulette {
    constructor() {
        this.people = [];
        this.tasks = [];
        this.assignments = [];
        this.history = [];
        this.availablePeople = [];
        this.availableTasks = [];

        // Load initial state from localStorage
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadFromStorage());
        } else {
            this.loadFromStorage();
        }
    }

    loadFromStorage() {
        const savedPeople = localStorage.getItem('ar_people');
        const savedTasks = localStorage.getItem('ar_tasks');
        const savedFair = localStorage.getItem('ar_fair');

        if (savedPeople) {
            const el = document.getElementById('peopleInput');
            if (el) el.value = savedPeople;
        }
        if (savedTasks) {
            const el = document.getElementById('tasksInput');
            if (el) el.value = savedTasks;
        }
        if (savedFair !== null) {
            const el = document.getElementById('fairDistribution');
            if (el) el.checked = savedFair === 'true';
        }

        console.log('📦 Aufgaben Roulette: Data loaded from storage');
    }

    saveToStorage() {
        const p = document.getElementById('peopleInput')?.value || '';
        const t = document.getElementById('tasksInput')?.value || '';
        const f = document.getElementById('fairDistribution')?.checked || false;

        localStorage.setItem('ar_people', p);
        localStorage.setItem('ar_tasks', t);
        localStorage.setItem('ar_fair', f);
    }

    loadData() {
        const peopleInput = document.getElementById('peopleInput').value;
        const tasksInput = document.getElementById('tasksInput').value;

        this.people = peopleInput.split('\n').filter(p => p.trim()).map(p => p.trim());
        this.tasks = tasksInput.split('\n').filter(t => t.trim()).map(t => t.trim());

        if (this.people.length === 0 || this.tasks.length === 0) {
            alert('❌ Bitte sowohl Personen als auch Aufgaben eingeben!');
            return;
        }

        this.availablePeople = [...this.people];
        this.availableTasks = [...this.tasks];

        // Clear current assignments when loading new data
        this.assignments = [];

        this.saveToStorage();

        document.getElementById('resultDisplay').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.5em; color: #38ef7d; margin-bottom: 15px;">✅ Daten geladen!</div>
                <p style="color: #b0b0b0;">
                    👥 ${this.people.length} Personen<br>
                    📋 ${this.tasks.length} Aufgaben
                </p>
            </div>
        `;

        this.updateDisplay();
    }

    assignTask() {
        if (this.people.length === 0 || this.tasks.length === 0) {
            // Versuche Daten automatisch zu laden falls Inputs befüllt sind aber people Array leer
            if (document.getElementById('peopleInput').value.trim() && document.getElementById('tasksInput').value.trim()) {
                this.loadData();
            } else {
                alert('❌ Bitte erst Daten eingeben und laden!');
                return;
            }
        }

        const fairDistribution = document.getElementById('fairDistribution').checked;

        // Prüfen ob noch Aufgaben verfügbar sind
        if (this.availableTasks.length === 0) {
            if (confirm('⚠️ Alle Aufgaben wurden verteilt! Zurücksetzen?')) {
                this.availableTasks = [...this.tasks];
            } else {
                return;
            }
        }

        // Prüfen ob noch Personen verfügbar sind (nur bei fairer Verteilung)
        if (fairDistribution && this.availablePeople.length === 0) {
            if (confirm('⚠️ Alle Personen haben eine Aufgabe! Zurücksetzen?')) {
                this.availablePeople = [...this.people];
            } else {
                return;
            }
        }

        // Zufällige Person und Aufgabe wählen
        const personPool = fairDistribution ? this.availablePeople : this.people;
        const personIndex = Math.floor(Math.random() * personPool.length);
        const taskIndex = Math.floor(Math.random() * this.availableTasks.length);

        const person = personPool[personIndex];
        const task = this.availableTasks[taskIndex];

        // Aus verfügbaren Listen entfernen (splice statt filter fix)
        this.availableTasks.splice(taskIndex, 1);
        if (fairDistribution) {
            // Wenn fair, entferne aus availablePeople
            const availIdx = this.availablePeople.indexOf(person);
            if (availIdx !== -1) this.availablePeople.splice(availIdx, 1);
        }

        // Zuweisung speichern
        const assignment = {
            person: person,
            task: task,
            timestamp: new Date().toLocaleString('de-DE')
        };

        this.assignments.push(assignment);
        this.history.push(assignment);

        // Ergebnis anzeigen
        document.getElementById('resultDisplay').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.3em; color: #c77dff; margin-bottom: 20px;">📋 Neue Zuweisung:</div>
                <div class="result-text">${person}</div>
                <div style="margin: 30px 0; font-size: 1.5em; color: #888;">↓</div>
                <div style="font-size: 1.8em; color: #38ef7d; line-height: 1.1;">${task}</div>
            </div>
        `;

        this.updateDisplay();
        this.saveToStorage();
    }

    updateDisplay() {
        this.updateAssignmentsList();
        this.updateHistoryList();
    }

    updateAssignmentsList() {
        const list = document.getElementById('assignmentsList');

        if (this.assignments.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #888;">Noch keine Aufgaben verteilt</p>';
            return;
        }

        list.innerHTML = this.assignments.map(a => `
            <div class="assignment-item">
                <div class="task">${a.task}</div>
                <div class="person">${a.person}</div>
            </div>
        `).join('');
    }

    updateHistoryList() {
        const list = document.getElementById('historyList');

        if (this.history.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #888;">Noch keine Historie</p>';
            return;
        }

        // Zeige letzte 10 Einträge (neueste zuerst)
        const recent = [...this.history].reverse().slice(0, 10);

        list.innerHTML = recent.map(h => `
            <div class="history-item">
                <span style="color: #c77dff;">${h.person}</span>
                <span style="color: #888;">→</span>
                <span style="color: #38ef7d; word-break: break-all;">${h.task.substring(0, 30)}${h.task.length > 30 ? '...' : ''}</span>
            </div>
        `).join('');
    }

    reset() {
        if (this.assignments.length === 0 && this.history.length === 0) return;

        if (confirm('🔄 Alles zurücksetzen (Zuweisungen & Historie)?')) {
            this.assignments = [];
            this.history = []; // Auch Historie leeren
            this.availablePeople = [...this.people];
            this.availableTasks = [...this.tasks];

            document.getElementById('resultDisplay').innerHTML = `
                <p style="color: #38ef7d; font-size: 1.5em;">✅ Zurückgesetzt!</p>
            `;

            this.updateDisplay();
        }
    }

    exportResults() {
        if (this.assignments.length === 0) {
            alert('❌ Noch keine Aufgaben zum Exportieren!');
            return;
        }

        let text = '🎯 AUFGABEN-VERTEILUNG\n';
        text += '='.repeat(50) + '\n\n';

        this.assignments.forEach((a, i) => {
            text += `${i + 1}. ${a.person}\n`;
            text += `   📋 ${a.task}\n`;
            text += `   🕐 ${a.timestamp}\n\n`;
        });

        text += '\n' + '='.repeat(50) + '\n';
        text += `Erstellt mit Lehrer Tools - Oberlinhaus ${new Date().toLocaleDateString('de-DE')}\n`;

        // Download als Textdatei
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Aufgaben-Verteilung_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('💾 Ergebnisse wurden exportiert!');
    }
}

// Initialisierung (global zugänglich machen)
window.roulette = new TaskRoulette();

