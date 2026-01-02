/*
    ╔═══════════════════════════════════════════════════╗
    ║  📤 EXPORT & SHARE CONTROLLER                     ║
    ║  PDF Export, Web Share API, QR Codes            ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

class ExportShareController {
    constructor() {
        this.init();
    }

    init() {
        // Check Web Share API support
        this.shareSupported = 'share' in navigator;
        console.log(`📤 Web Share API: ${this.shareSupported ? 'Supported' : 'Not Supported'}`);
    }

    // ========================================
    // WEB SHARE API
    // ========================================
    async share(data) {
        if (!this.shareSupported) {
            this.fallbackShare(data);
            return;
        }

        try {
            await navigator.share({
                title: data.title || 'Lehrer-Tools',
                text: data.text || '',
                url: data.url || window.location.href
            });
            
            console.log('✅ Shared successfully');
            
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification('📤 Erfolgreich geteilt!', 'success', 2000);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('❌ Share error:', error);
                this.fallbackShare(data);
            }
        }
    }

    fallbackShare(data) {
        // Copy link to clipboard
        const url = data.url || window.location.href;
        this.copyToClipboard(url);
        
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification('📋 Link in Zwischenablage kopiert', 'success', 3000);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    }

    // ========================================
    // SHARE GAME RESULTS
    // ========================================
    shareGameResult(gameName, score, details = {}) {
        const data = {
            title: `🎮 ${gameName} Ergebnis`,
            text: `Ich habe ${score} Punkte in ${gameName} erreicht! 🏆\n\nSpiel jetzt mit unter: ${window.location.origin}`,
            url: window.location.origin + '/seiten/game.html'
        };
        
        this.share(data);
    }

    shareHighscore(gameName, highscore) {
        const data = {
            title: `🏆 Neuer Highscore in ${gameName}!`,
            text: `Ich habe einen neuen Highscore von ${highscore} Punkten erreicht! 🎉\n\nVersuch es selbst:`,
            url: window.location.origin + '/seiten/game.html'
        };
        
        this.share(data);
    }

    // ========================================
    // PDF EXPORT (Notenrechner)
    // ========================================
    async exportNotenschluesselPDF(data) {
        try {
            // jsPDF dynamisch laden
            if (typeof window.jspdf === 'undefined') {
                await this.loadJsPDF();
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(157, 77, 221);
            doc.text('Notenschlüssel', 105, 20, { align: 'center' });

            // Datum
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 105, 30, { align: 'center' });

            // Info
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Maximale Punktzahl: ${data.maxPoints}`, 20, 45);
            doc.text(`Note: ${data.grade}`, 20, 55);
            doc.text(`Erreichte Punkte: ${data.points}`, 20, 65);
            doc.text(`Prozent: ${data.percentage}%`, 20, 75);

            // Tabelle (wenn vorhanden)
            if (data.table && data.table.length > 0) {
                let y = 95;
                doc.setFontSize(14);
                doc.text('Notenschlüssel-Tabelle:', 20, y);
                
                y += 10;
                doc.setFontSize(10);
                doc.setDrawColor(157, 77, 221);
                doc.setLineWidth(0.5);
                
                // Header
                doc.rect(20, y, 170, 10);
                doc.text('Note', 25, y + 7);
                doc.text('Punkte von', 70, y + 7);
                doc.text('Punkte bis', 120, y + 7);
                doc.text('Prozent', 160, y + 7);
                
                y += 10;
                
                // Rows
                data.table.forEach(row => {
                    doc.rect(20, y, 170, 10);
                    doc.text(row.grade.toString(), 25, y + 7);
                    doc.text(row.pointsFrom.toString(), 70, y + 7);
                    doc.text(row.pointsTo.toString(), 120, y + 7);
                    doc.text(row.percent.toString() + '%', 160, y + 7);
                    y += 10;
                });
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Erstellt mit Lehrer-Tools | Berufsbildungswerk im Oberlinhaus Potsdam', 105, 285, { align: 'center' });

            // Download
            doc.save(`Notenschluessel_${new Date().toISOString().split('T')[0]}.pdf`);

            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification('📄 PDF erfolgreich exportiert!', 'success', 3000);
            }

        } catch (error) {
            console.error('❌ PDF export error:', error);
            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification('❌ PDF-Export fehlgeschlagen', 'danger', 3000);
            }
        }
    }

    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ========================================
    // STATISTICS EXPORT
    // ========================================
    exportStatisticsJSON() {
        if (window.statsController) {
            window.statsController.exportStats();
        } else {
            console.error('❌ Statistics controller not available');
        }
    }

    exportStatisticsPDF() {
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification('📊 PDF-Export wird bald verfügbar sein!', 'info', 3000);
        }
    }

    // ========================================
    // QR CODE GENERATION
    // ========================================
    async generateQRCode(text, size = 256) {
        try {
            // QRCode.js dynamisch laden
            if (typeof QRCode === 'undefined') {
                await this.loadQRCodeJS();
            }

            const container = document.createElement('div');
            container.style.cssText = 'position: fixed; top: -9999px; left: -9999px;';
            document.body.appendChild(container);

            const qr = new QRCode(container, {
                text: text,
                width: size,
                height: size,
                colorDark: '#9d4edd',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            // Warte bis QR Code generiert ist
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = container.querySelector('canvas');
            const dataURL = canvas.toDataURL('image/png');

            document.body.removeChild(container);

            return dataURL;

        } catch (error) {
            console.error('❌ QR Code generation error:', error);
            return null;
        }
    }

    async loadQRCodeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async showQRCode(text, title = 'QR Code') {
        const qrDataURL = await this.generateQRCode(text);
        if (!qrDataURL) return;

        // Modal erstellen
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.innerHTML = `
            <div class="qr-modal-content">
                <div class="qr-modal-header">
                    <h3>${title}</h3>
                    <button class="qr-modal-close" onclick="this.closest('.qr-modal').remove()">×</button>
                </div>
                <div class="qr-modal-body">
                    <img src="${qrDataURL}" alt="QR Code" class="qr-code-image">
                    <p class="qr-text">${text}</p>
                </div>
                <div class="qr-modal-actions">
                    <button class="btn btn-primary" onclick="exportShareController.downloadQRCode('${qrDataURL}', '${title}')">
                        📥 Herunterladen
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.qr-modal').remove()">
                        Schließen
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // ESC to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    downloadQRCode(dataURL, title = 'QR-Code') {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.png`;
        link.click();

        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification('📥 QR Code heruntergeladen!', 'success', 2000);
        }
    }

    // ========================================
    // EXPORT TO CSV
    // ========================================
    exportToCSV(data, filename) {
        try {
            const csv = this.convertToCSV(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            URL.revokeObjectURL(url);

            if (typeof AnimationsController !== 'undefined') {
                AnimationsController.showNotification('📊 CSV erfolgreich exportiert!', 'success', 2000);
            }

        } catch (error) {
            console.error('❌ CSV export error:', error);
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(header => `"${row[header]}"`).join(',')
        );
        
        return [headers.join(','), ...rows].join('\n');
    }

    // ========================================
    // PRINT FUNCTIONALITY
    // ========================================
    print() {
        window.print();
    }

    // ========================================
    // PUBLIC API
    // ========================================
    shareCurrentPage() {
        this.share({
            title: document.title,
            url: window.location.href
        });
    }

    async generateShareLink(data) {
        const url = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(JSON.stringify(data))}`;
        await this.copyToClipboard(url);
        
        if (typeof AnimationsController !== 'undefined') {
            AnimationsController.showNotification('🔗 Share-Link kopiert!', 'success', 2000);
        }
    }
}

// ========================================
// AUTO-INIT
// ========================================
const exportShareController = new ExportShareController();
window.exportShareController = exportShareController;

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportShareController;
}
