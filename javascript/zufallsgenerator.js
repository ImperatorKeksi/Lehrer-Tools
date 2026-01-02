/*
╔═══════════════════════════════════════════════════╗
║  🎲 ZUFALLS-GENERATOR - LOGIK                    ║
║  Schüler, Teams, Würfel, Münze & Glücksrad       ║
║                                                   ║
║  Entwickler: Nico Kaschube                       ║
║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
╚═══════════════════════════════════════════════════╝
*/

class RandomGenerator {
    constructor() {
        this.students = [];
        this.availableStudents = [];
    }

    switchTab(tabName) {
        // Tabs aktualisieren
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Content aktualisieren
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    // =============================================
    // SCHÜLER AUSWAHL
    // =============================================

    loadStudents() {
        const input = document.getElementById('studentInput').value;
        this.students = input.split('\n').filter(s => s.trim()).map(s => s.trim());

        if (this.students.length === 0) {
            alert('❌ Bitte mindestens einen Schüler eingeben!');
            return;
        }

        this.availableStudents = [...this.students];
        this.displayStudentList();
        
        document.getElementById('studentResult').innerHTML = `
            <p style="color: #38ef7d;">✅ ${this.students.length} Schüler geladen!</p>
        `;
    }

    pickRandomStudent() {
        if (this.students.length === 0) {
            alert('❌ Bitte erst eine Schülerliste laden!');
            return;
        }

        const withReplacement = document.getElementById('withReplacement').checked;

        if (!withReplacement && this.availableStudents.length === 0) {
            alert('⚠️ Alle Schüler wurden bereits ausgewählt! Setze die Liste zurück.');
            return;
        }

        const pool = withReplacement ? this.students : this.availableStudents;
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[randomIndex];

        if (!withReplacement) {
            this.availableStudents.splice(randomIndex, 1);
        }

        // Animation
        document.getElementById('studentResult').innerHTML = `
            <div class="result-text">${selected}</div>
        `;

        this.displayStudentList(selected);
    }

    displayStudentList(selected = null) {
        const display = document.getElementById('studentListDisplay');
        
        display.innerHTML = `
            <div style="margin-top: 20px;">
                <h3 style="color: #c77dff; margin-bottom: 15px;">
                    📋 Schülerliste (${this.availableStudents.length} verfügbar)
                </h3>
                <div class="student-list">
                    ${this.students.map(student => `
                        <div class="student-chip ${student === selected ? 'selected' : ''} ${!this.availableStudents.includes(student) ? 'style="opacity: 0.4;"' : ''}">
                            ${student}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    resetStudents() {
        this.availableStudents = [...this.students];
        this.displayStudentList();
        document.getElementById('studentResult').innerHTML = `
            <p style="color: #38ef7d;">🔄 Liste zurückgesetzt!</p>
        `;
    }

    // =============================================
    // TEAM GENERATOR
    // =============================================

    generateTeams() {
        const input = document.getElementById('teamStudentInput').value;
        const students = input.split('\n').filter(s => s.trim()).map(s => s.trim());
        const teamCount = parseInt(document.getElementById('teamCount').value);

        if (students.length === 0) {
            alert('❌ Bitte Schüler eingeben!');
            return;
        }

        if (teamCount < 2 || teamCount > students.length) {
            alert('❌ Ungültige Anzahl Teams!');
            return;
        }

        // Fisher-Yates Shuffle
        const shuffled = [...students];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Teams aufteilen
        const teams = Array(teamCount).fill(null).map(() => []);
        shuffled.forEach((student, index) => {
            teams[index % teamCount].push(student);
        });

        // Teams anzeigen
        const display = document.getElementById('teamsDisplay');
        display.innerHTML = teams.map((team, index) => `
            <div class="team-card">
                <h3>Team ${index + 1} (${team.length} Mitglieder)</h3>
                <ul>
                    ${team.map(member => `<li>👤 ${member}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    // =============================================
    // WÜRFEL
    // =============================================

    rollDice() {
        const count = parseInt(document.getElementById('diceCount').value);
        const results = [];

        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * 6) + 1);
        }

        const total = results.reduce((a, b) => a + b, 0);

        document.getElementById('diceResult').innerHTML = `
            <div>
                <div class="dice-container">
                    ${results.map(result => `
                        <div class="dice">
                            ${this.getDiceEmoji(result)}
                        </div>
                    `).join('')}
                </div>
                ${count > 1 ? `<div style="text-align: center; margin-top: 20px; font-size: 2em; color: #38ef7d;">Summe: ${total}</div>` : ''}
            </div>
        `;
    }

    getDiceEmoji(number) {
        const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return emojis[number - 1];
    }

    // =============================================
    // MÜNZWURF
    // =============================================

    flipCoin() {
        const result = Math.random() < 0.5 ? 'Kopf' : 'Zahl';
        const emoji = result === 'Kopf' ? '👑' : '💰';

        document.getElementById('coinResult').innerHTML = `
            <div>
                <div class="coin">${emoji}</div>
                <div class="result-text" style="margin-top: 30px;">${result}</div>
            </div>
        `;
    }

    // =============================================
    // GLÜCKSRAD
    // =============================================

    spinWheel() {
        const input = document.getElementById('wheelOptions').value;
        const options = input.split('\n').filter(o => o.trim()).map(o => o.trim());

        if (options.length < 2) {
            alert('❌ Bitte mindestens 2 Optionen eingeben!');
            return;
        }

        const selected = options[Math.floor(Math.random() * options.length)];

        // Animiertes Rad erstellen
        const colors = ['#667eea', '#764ba2', '#11998e', '#38ef7d', '#ee0979', '#ff6a00'];
        const segments = options.map((opt, i) => {
            return {
                option: opt,
                color: colors[i % colors.length]
            };
        });

        const segmentAngle = 360 / segments.length;
        const wheelHtml = segments.map((seg, i) => {
            const rotation = i * segmentAngle;
            return `
                <div style="
                    position: absolute;
                    width: 50%;
                    height: 50%;
                    top: 50%;
                    left: 50%;
                    transform-origin: 0 0;
                    transform: rotate(${rotation}deg) skewY(${90 - segmentAngle}deg);
                    background: ${seg.color};
                    border: 2px solid rgba(255, 255, 255, 0.2);
                "></div>
            `;
        }).join('');

        // Zufällige Rotation (mehrere Umdrehungen + Zielposition)
        const selectedIndex = options.indexOf(selected);
        const targetAngle = selectedIndex * segmentAngle;
        const spins = 5; // Anzahl volle Umdrehungen
        const totalRotation = (spins * 360) + (360 - targetAngle);

        document.getElementById('wheelResult').innerHTML = `
            <div style="text-align: center;">
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <div class="wheel" id="wheelSpin" style="transform: rotate(${totalRotation}deg);">
                        ${wheelHtml}
                    </div>
                </div>
                <div class="result-text" style="margin-top: 40px;">
                    🎉 ${selected}
                </div>
            </div>
        `;

        // Nach Animation zurücksetzen
        setTimeout(() => {
            const wheel = document.getElementById('wheelSpin');
            if (wheel) {
                wheel.style.transition = 'none';
                wheel.style.transform = `rotate(${360 - targetAngle}deg)`;
            }
        }, 4000);
    }
}

// Initialisierung
const randomGen = new RandomGenerator();

