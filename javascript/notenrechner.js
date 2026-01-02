/*
╔═══════════════════════════════════════════════════╗
║  📊 NOTEN-RECHNER - LOGIK                        ║
║  IHK, Linear & Gauß Notenschlüssel               ║
║                                                   ║
║  Entwickler: Nico Kaschube                       ║
║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
╚═══════════════════════════════════════════════════╝
*/

class GradeCalculator {
    constructor() {
        this.maxPoints = 100;
        this.gradeSystem = 'german';
        this.distribution = 'linear';
        this.gradeTable = [];
    }

    generateTable() {
        this.maxPoints = parseInt(document.getElementById('maxPoints').value);
        this.gradeSystem = document.getElementById('gradeSystem').value;
        this.distribution = document.getElementById('distribution').value;

        if (this.maxPoints < 1) {
            alert('❌ Maximale Punktzahl muss mindestens 1 sein!');
            return;
        }

        this.gradeTable = this.calculateGradeTable();
        this.displayTable();
    }

    calculateGradeTable() {
        const table = [];

        for (let points = 0; points <= this.maxPoints; points++) {
            const percentage = (points / this.maxPoints) * 100;
            let grade = this.getGrade(percentage);
            
            table.push({
                points: points,
                percentage: percentage.toFixed(1),
                grade: grade
            });
        }

        return table;
    }

    getGrade(percentage) {
        let grade;

        if (this.distribution === 'linear') {
            grade = this.linearGrade(percentage);
        } else if (this.distribution === 'ihk') {
            grade = this.ihkGrade(percentage);
        } else if (this.distribution === 'gauss') {
            grade = this.gaussGrade(percentage);
        }

        if (this.gradeSystem === 'percent') {
            return percentage.toFixed(1) + '%';
        } else if (this.gradeSystem === 'points') {
            return Math.round((percentage / 100) * 15);
        }

        return grade.toFixed(1);
    }

    linearGrade(percentage) {
        if (percentage >= 92) return 1.0;
        if (percentage >= 81) return 2.0;
        if (percentage >= 67) return 3.0;
        if (percentage >= 50) return 4.0;
        if (percentage >= 30) return 5.0;
        return 6.0;
    }

    ihkGrade(percentage) {
        // IHK Notenschlüssel
        if (percentage >= 92) return 1.0;
        if (percentage >= 89) return 1.3;
        if (percentage >= 86) return 1.7;
        if (percentage >= 83) return 2.0;
        if (percentage >= 80) return 2.3;
        if (percentage >= 77) return 2.7;
        if (percentage >= 74) return 3.0;
        if (percentage >= 71) return 3.3;
        if (percentage >= 68) return 3.7;
        if (percentage >= 65) return 4.0;
        if (percentage >= 62) return 4.3;
        if (percentage >= 59) return 4.7;
        if (percentage >= 50) return 5.0;
        return 6.0;
    }

    gaussGrade(percentage) {
        // Gauß-Verteilung (Normalverteilung)
        if (percentage >= 95) return 1.0;
        if (percentage >= 88) return 1.5;
        if (percentage >= 80) return 2.0;
        if (percentage >= 70) return 2.5;
        if (percentage >= 60) return 3.0;
        if (percentage >= 50) return 3.5;
        if (percentage >= 40) return 4.0;
        if (percentage >= 25) return 5.0;
        return 6.0;
    }

    displayTable() {
        const display = document.getElementById('gradeTable');
        
        // Gruppiere nach Noten für kompakte Anzeige
        const grouped = {};
        this.gradeTable.forEach(row => {
            if (!grouped[row.grade]) {
                grouped[row.grade] = {
                    minPoints: row.points,
                    maxPoints: row.points,
                    minPercent: parseFloat(row.percentage),
                    maxPercent: parseFloat(row.percentage)
                };
            } else {
                grouped[row.grade].maxPoints = row.points;
                grouped[row.grade].maxPercent = parseFloat(row.percentage);
            }
        });

        let html = '<table><thead><tr><th>Note</th><th>Punktebereich</th><th>Prozent</th></tr></thead><tbody>';

        Object.keys(grouped).sort((a, b) => {
            // Sortiere nach Note (aufsteigend für 1-6, absteigend für Prozent/Punkte)
            if (this.gradeSystem === 'percent' || this.gradeSystem === 'points') {
                return parseFloat(b) - parseFloat(a);
            }
            return parseFloat(a) - parseFloat(b);
        }).forEach(grade => {
            const data = grouped[grade];
            const gradeClass = this.getGradeClass(grade);
            
            html += `
                <tr class="${gradeClass}">
                    <td><strong>${grade}</strong></td>
                    <td>${data.minPoints} - ${data.maxPoints} Punkte</td>
                    <td>${data.minPercent.toFixed(1)}% - ${data.maxPercent.toFixed(1)}%</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        display.innerHTML = html;
    }

    getGradeClass(grade) {
        if (this.gradeSystem === 'german') {
            const gradeNum = parseFloat(grade);
            if (gradeNum <= 1.5) return 'grade-1';
            if (gradeNum <= 2.5) return 'grade-2';
            if (gradeNum <= 3.5) return 'grade-3';
            if (gradeNum <= 4.5) return 'grade-4';
            if (gradeNum <= 5.5) return 'grade-5';
            return 'grade-6';
        }
        return '';
    }

    calculateGrade() {
        const points = parseFloat(document.getElementById('achievedPoints').value);
        
        if (isNaN(points) || points < 0) {
            alert('❌ Bitte eine gültige Punktzahl eingeben!');
            return;
        }

        if (points > this.maxPoints) {
            alert(`⚠️ Punktzahl darf nicht größer als ${this.maxPoints} sein!`);
            return;
        }

        const percentage = (points / this.maxPoints) * 100;
        const grade = this.getGrade(percentage);

        const resultDiv = document.getElementById('gradeResult');
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3>📊 Ergebnis</h3>
                <p><strong>Erreichte Punkte:</strong> ${points} / ${this.maxPoints}</p>
                <p><strong>Prozent:</strong> ${percentage.toFixed(1)}%</p>
                <div class="result-value">${grade}</div>
                <p style="text-align: center; color: #b0b0b0; margin-top: 10px;">
                    ${this.getGradeText(grade)}
                </p>
            </div>
        `;
    }

    getGradeText(grade) {
        if (this.gradeSystem === 'german') {
            const gradeNum = parseFloat(grade);
            if (gradeNum <= 1.5) return '🌟 Sehr gut!';
            if (gradeNum <= 2.5) return '✅ Gut!';
            if (gradeNum <= 3.5) return '👍 Befriedigend';
            if (gradeNum <= 4.5) return '✔️ Ausreichend';
            if (gradeNum <= 5.5) return '⚠️ Mangelhaft';
            return '❌ Ungenügend';
        }
        return '';
    }

    calculateAverage() {
        const input = document.getElementById('gradeList').value;
        const grades = input.split(',').map(g => parseFloat(g.trim())).filter(g => !isNaN(g));

        if (grades.length === 0) {
            alert('❌ Bitte gültige Noten eingeben!');
            return;
        }

        const average = grades.reduce((a, b) => a + b, 0) / grades.length;
        const min = Math.min(...grades);
        const max = Math.max(...grades);

        const resultDiv = document.getElementById('averageResult');
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3>📈 Schnitt-Analyse</h3>
                <p><strong>Anzahl Noten:</strong> ${grades.length}</p>
                <p><strong>Beste Note:</strong> ${min.toFixed(2)}</p>
                <p><strong>Schlechteste Note:</strong> ${max.toFixed(2)}</p>
                <div class="result-value">${average.toFixed(2)}</div>
                <p style="text-align: center; color: #b0b0b0; margin-top: 10px;">
                    Notendurchschnitt
                </p>
            </div>
        `;
    }
}

// Initialisierung
const calculator = new GradeCalculator();

// Standardtabelle beim Laden generieren
window.addEventListener('load', () => {
    calculator.generateTable();
});
