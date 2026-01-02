/*
╔═══════════════════════════════════════════════════╗
║  🌍 STADT LAND FLUSS - LOGIK                     ║
║  Timer, Duplikat-Erkennung & Punkteberechnung    ║
║                                                   ║
║  Entwickler: Nico Kaschube                       ║
║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
╚═══════════════════════════════════════════════════╝
*/

class StadtLandFlussGame {
    constructor() {
        this.players = [];
        this.categories = ['Stadt', 'Land', 'Fluss', 'Tier', 'Beruf'];
        this.currentLetter = '';
        this.roundData = {};
        this.scores = {};
        this.timerDuration = 60;
        this.timerInterval = null;
        this.timeLeft = 0;
        this.initializeEventListeners();
        this.updateCategoriesList();
    }

    initializeEventListeners() {
        // Enter-Taste für Spieler
        document.getElementById('playerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });

        // Enter-Taste für Kategorien
        document.getElementById('categoryInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCategory();
        });
    }

    addPlayer() {
        const input = document.getElementById('playerInput');
        const name = input.value.trim();

        if (!name) {
            alert('❌ Bitte einen Namen eingeben!');
            return;
        }

        if (this.players.includes(name)) {
            alert('⚠️ Spieler bereits vorhanden!');
            return;
        }

        this.players.push(name);
        this.scores[name] = 0;
        input.value = '';
        this.updatePlayersList();
    }

    removePlayer(name) {
        const index = this.players.indexOf(name);
        if (index > -1) {
            this.players.splice(index, 1);
            delete this.scores[name];
            this.updatePlayersList();
        }
    }

    updatePlayersList() {
        const list = document.getElementById('playersList');
        
        if (this.players.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #888;">Noch keine Spieler</p>';
            return;
        }

        list.innerHTML = `
            <label style="color: #c77dff; font-weight: 600; margin-bottom: 10px; display: block;">
                👥 Spieler (${this.players.length}):
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                ${this.players.map(player => `
                    <div class="category-chip">
                        <span>${player}</span>
                        <button onclick="game.removePlayer('${player}')">×</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    addCategory() {
        const input = document.getElementById('categoryInput');
        const category = input.value.trim();

        if (!category) {
            alert('❌ Bitte eine Kategorie eingeben!');
            return;
        }

        if (this.categories.includes(category)) {
            alert('⚠️ Kategorie bereits vorhanden!');
            return;
        }

        this.categories.push(category);
        input.value = '';
        this.updateCategoriesList();
    }

    removeCategory(category) {
        const index = this.categories.indexOf(category);
        if (index > -1) {
            this.categories.splice(index, 1);
            this.updateCategoriesList();
        }
    }

    updateCategoriesList() {
        const list = document.getElementById('categoriesList');
        list.innerHTML = this.categories.map(cat => `
            <div class="category-chip">
                <span>${cat}</span>
                <button onclick="game.removeCategory('${cat}')">×</button>
            </div>
        `).join('');
    }

    startGame() {
        if (this.players.length < 1) {
            alert('❌ Mindestens 1 Spieler benötigt!');
            return;
        }

        if (this.categories.length < 1) {
            alert('❌ Mindestens 1 Kategorie benötigt!');
            return;
        }

        this.timerDuration = parseInt(document.getElementById('timerDuration').value);

        document.getElementById('setupPhase').classList.add('hidden');
        document.getElementById('gamePhase').classList.remove('hidden');

        this.newRound();
    }

    newRound() {
        // Zufälligen Buchstaben wählen (keine Q, X, Y)
        const letters = 'ABCDEFGHIJKLMNOPRSTUVWZ';
        this.currentLetter = letters[Math.floor(Math.random() * letters.length)];
        
        document.getElementById('letterDisplay').textContent = this.currentLetter;
        
        // Round Data zurücksetzen
        this.roundData = {};
        this.players.forEach(player => {
            this.roundData[player] = {};
            this.categories.forEach(cat => {
                this.roundData[player][cat] = '';
            });
        });

        this.createGameTable();
        this.timeLeft = this.timerDuration;
        this.updateTimerDisplay();
    }

    createGameTable() {
        const table = document.getElementById('gameTable');
        
        let html = '<thead><tr><th>Spieler</th>';
        this.categories.forEach(cat => {
            html += `<th>${cat}</th>`;
        });
        html += '<th>Punkte</th></tr></thead><tbody>';

        this.players.forEach(player => {
            html += `<tr><td><strong>${player}</strong></td>`;
            this.categories.forEach(cat => {
                html += `<td><input type="text" 
                    id="input-${player}-${cat}" 
                    data-player="${player}" 
                    data-category="${cat}"
                    onchange="game.updateAnswer(this)"
                    placeholder="${this.currentLetter}..."></td>`;
            });
            html += `<td class="points-cell" id="points-${player}">0</td></tr>`;
        });

        html += '</tbody>';
        table.innerHTML = html;
    }

    updateAnswer(input) {
        const player = input.dataset.player;
        const category = input.dataset.category;
        this.roundData[player][category] = input.value.trim();
    }

    startTimer() {
        if (this.timerInterval) return;

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.stopTimer();
                alert('⏰ Zeit abgelaufen!');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = document.getElementById('timerDisplay');
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timeLeft <= 10) {
            display.classList.add('warning');
        } else {
            display.classList.remove('warning');
        }
    }

    calculatePoints() {
        this.stopTimer();

        // Alle Antworten pro Kategorie sammeln
        const allAnswers = {};
        this.categories.forEach(cat => {
            allAnswers[cat] = [];
            this.players.forEach(player => {
                const answer = this.roundData[player][cat].toLowerCase().trim();
                if (answer) {
                    allAnswers[cat].push({
                        player: player,
                        answer: answer
                    });
                }
            });
        });

        // Punkte berechnen
        this.players.forEach(player => {
            let roundPoints = 0;

            this.categories.forEach(cat => {
                const answer = this.roundData[player][cat].toLowerCase().trim();
                const input = document.getElementById(`input-${player}-${cat}`);

                if (!answer) {
                    input.classList.remove('duplicate', 'unique');
                    return;
                }

                // Prüfen ob Antwort mit richtigem Buchstaben beginnt
                if (!answer.startsWith(this.currentLetter.toLowerCase())) {
                    input.classList.add('duplicate');
                    return;
                }

                // Duplikate finden
                const duplicates = allAnswers[cat].filter(a => a.answer === answer);

                if (duplicates.length === 1) {
                    // Einzigartig
                    roundPoints += 20;
                    input.classList.add('unique');
                    input.classList.remove('duplicate');
                } else {
                    // Duplikat
                    roundPoints += 5;
                    input.classList.add('duplicate');
                    input.classList.remove('unique');
                }
            });

            // Punkte aktualisieren
            this.scores[player] += roundPoints;
            document.getElementById(`points-${player}`).textContent = roundPoints;
        });

        this.updateScoreboard();
    }

    updateScoreboard() {
        const scoreList = document.getElementById('scoreList');
        
        // Sortiere nach Punkten
        const sorted = [...this.players].sort((a, b) => this.scores[b] - this.scores[a]);
        const maxScore = this.scores[sorted[0]];

        scoreList.innerHTML = sorted.map((player, index) => {
            const isWinner = this.scores[player] === maxScore;
            return `
                <div class="score-item ${isWinner ? 'winner' : ''}">
                    <div class="player-name">
                        ${isWinner ? '🏆 ' : `${index + 1}. `}${player}
                    </div>
                    <div class="player-score">${this.scores[player]} Pkt</div>
                </div>
            `;
        }).join('');
    }
}

// Initialisierung
const game = new StadtLandFlussGame();
