# 📁 Projekt-Struktur - Keksi Webseite Spiel

## ✅ Saubere Organisation

```
📂 Keksi-webseite-spiel/
│
├── 📄 START.html                   ← START HIER! Zentrale Startdatei
├── 📄 README.md                    ← Projekt-Dokumentation
├── 📄 package.json                 ← NPM Konfiguration
├── 📄 .gitignore                   ← Git Ignore Rules
│
├── 📁 config/                      ← Build-Konfiguration
│   └── vite.config.js              # Vite Build System (nur für Production!)
│
├── 📁 docs/                        ← Dokumentation & Guides
│   ├── BUILD_GUIDE.md              # Build System Anleitung
│   ├── CODE_DOCUMENTATION.md       # Code Dokumentation (450+ Zeilen)
│   ├── TESTING_GUIDE.md            # Testing Checklisten
│   └── PROJECT_STRUCTURE.md        # Diese Datei
│
├── 📁 seiten/                      ← HTML-Seiten
│   ├── index.html                  # Hauptmenü & Tool-Übersicht
│   └── game.html                   # Jeopardy Quiz
│
├── 📁 javascript/                  ← JavaScript Module
│   ├── script.js                   # Hauptspiel-Logik (1742 Zeilen)
│   ├── modules.js                  # Core Modules (GameState, Performance)
│   ├── auth.js                     # Authentication System
│   ├── auth-ui.js                  # Auth UI Components
│   ├── editor.js                   # Fragen-Editor
│   ├── stats.js                    # Statistiken & Analytics
│   ├── feedback.js                 # Feedback-System (795 Zeilen)
│   ├── toast.js                    # Toast Notifications (359 Zeilen) ✨ NEU
│   ├── loading-states.js           # Loading States (316 Zeilen) ✨ NEU
│   ├── micro-animations.js         # Animationen (391 Zeilen) ✨ NEU
│   ├── accessibility.js            # WCAG 2.1 AA Compliance (382 Zeilen)
│   ├── error-handler.js            # Global Error Handling
│   ├── production-config.js        # Production Configuration
│   ├── animations.js               # Animation System
│   ├── sounds.js                   # Audio System (Web Audio API)
│   ├── main.js                     # Main Page Logic
│   └── responsive.js               # Responsive Behavior
│
├── 📁 stylesheets/                 ← CSS-Styles
│   ├── main.css                    # Landing Page Styles
│   ├── styles.css                  # Spiel-Styles
│   ├── animations.css              # Animation System
│   └── responsive.css              # Responsive Design
│
├── 📁 fragenkataloge/              ← Fragen-Datenbanken
│   ├── questions_standard.js       # Standard Fragen (25 Kategorien)
│   ├── questions_it.js             # IT-spezifische Fragen
│   ├── questions_kaufmaennisch.js  # Kaufmännische Fragen
│   ├── questions_lagerlogistik.js  # Lagerlogistik Fragen
│   └── questions.js                # Legacy Questions (deprecated)
│
├── 📁 icons/                       ← App Icons & Logos
│   ├── logo-simple.svg             # Simple Logo
│   ├── icon-*.png                  # PWA Icons (verschiedene Größen)
│   └── ...
│
├── 📁 pwa/                         ← Progressive Web App
│   ├── manifest.json               # Web App Manifest
│   └── sw.js                       # Service Worker
│
├── 📁 tools/                       ← Entwickler-Tools
│   └── generate_icons.html         # Icon Generator Tool
│
└── 📁 node_modules/                ← NPM Dependencies (gitignored)

```

## 🚀 Development Workflow

### **Option 1: Live Server (EMPFOHLEN für Development)**
1. Rechtsklick auf `START.html` oder `seiten/game.html`
2. Wähle "Open with Live Server"
3. Seite öffnet sich auf `http://localhost:5500`

**Vorteile:**
- ✅ Einfach & schnell
- ✅ Kein Setup nötig
- ✅ Auto-Refresh
- ✅ Keine Konflikte

### **Option 2: Vite Build System (NUR für Production)**
```bash
# Production Build erstellen
npm run build

# Production Preview
npm run preview
```

**⚠️ NICHT für Development nutzen!** 
- Vite kann mit klassischen Script-Tags Probleme machen
- Nur für Production Builds verwenden

## 📊 Datei-Statistiken

| Kategorie | Dateien | Zeilen |
|-----------|---------|--------|
| **HTML** | 3 | ~2,000 |
| **JavaScript** | 18 | ~16,000 |
| **CSS** | 4 | ~4,000 |
| **Fragen-DB** | 5 | ~3,000 |
| **Dokumentation** | 5 | ~1,500 |
| **GESAMT** | 35+ | **~26,500** |

## 🎯 Wichtige Dateien

### **Start-Dateien**
- `START.html` - Haupteinstieg (HIER STARTEN!)
- `seiten/index.html` - Hauptmenü
- `seiten/game.html` - Jeopardy Quiz

### **Core JavaScript**
- `javascript/script.js` - Hauptlogik (1742 Zeilen)
- `javascript/modules.js` - Core Module
- `javascript/production-config.js` - Config

### **Neue Features (v2.0)**
- `javascript/toast.js` - Toast Notifications ✨
- `javascript/loading-states.js` - Loading States ✨
- `javascript/micro-animations.js` - Animationen ✨

### **Dokumentation**
- `README.md` - Projekt-Übersicht
- `docs/CODE_DOCUMENTATION.md` - Code Doku
- `docs/TESTING_GUIDE.md` - Testing
- `docs/BUILD_GUIDE.md` - Build System

## 🔧 Build-Dateien (nicht im Git)

```
node_modules/          # NPM Dependencies (gitignored)
package-lock.json      # NPM Lock File (gitignored)
dist/                  # Production Build Output (gitignored)
.vite/                 # Vite Cache (gitignored)
```

## 📝 Änderungshistorie

**v2.0.0 (November 2025)**
- ✅ Build System Setup (Vite)
- ✅ UI/UX Polish (Toast, Loading, Animations)
- ✅ Projekt-Struktur aufgeräumt
- ✅ Dokumentation erweitert

**v1.0.0 (Oktober 2025)**
- ✅ Basis-Spiel implementiert
- ✅ PWA Support
- ✅ Authentication
- ✅ Editor System
