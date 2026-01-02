/*
    ╔═══════════════════════════════════════════════════╗
    ║  🚀 UNIVERSAL ENHANCEMENTS LOADER                 ║
    ║  Auto-lädt alle neuen Features auf jeder Seite   ║
    ║                                                   ║
    ║  Entwickler: Nico Kaschube                       ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚═══════════════════════════════════════════════════╝
*/

// Automatisch CSS laden wenn nicht vorhanden
(function() {
    const cssFiles = [
        'theme.css',        // Theme als erstes (Variables)
        'animations.css',
        'responsive.css',
        'accessibility.css',
        'pwa-styles.css',
        'statistics.css',
        'export-share.css'
    ];

    cssFiles.forEach(file => {
        const path = `../stylesheets/${file}`;
        if (!document.querySelector(`link[href*="${file}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
        }
    });

    // JavaScript Files laden
    const jsFiles = [
        'performance.js',           // Performance als erstes (wichtig!)
        'statistics.js',            // Statistics früh laden
        'export-share.js',          // Export & Share
        'haptic-feedback.js',       // Haptic & Enhanced Sound
        'animations.js',
        'responsive.js',
        'accessibility.js',
        'pwa-controller.js'
    ];

    jsFiles.forEach(file => {
        const path = `../javascript/${file}`;
        if (!document.querySelector(`script[src*="${file}"]`)) {
            const script = document.createElement('script');
            script.src = path;
            script.async = false; // Reihenfolge beibehalten
            document.head.appendChild(script);
        }
    });
})();
