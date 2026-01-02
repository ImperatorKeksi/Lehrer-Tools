# 📊 Analytics System - Dokumentation

**Entwickler:** Nico Kaschube  
**Berufsbildungswerk im Oberlinhaus Potsdam | 2025**

---

## 🎯 Übersicht

Das Analytics-System ist ein **100% lokales**, **DSGVO-konformes** Tracking-System für das Jeopardy-Quiz. Es speichert alle Daten ausschließlich im **LocalStorage** des Browsers und sendet **keine Daten an externe Server**.

---

## ✨ Features

### 🔐 Datenschutz (DSGVO-konform)
- ✅ **Opt-in erforderlich**: Standardmäßig deaktiviert
- ✅ **100% lokal**: Keine externe Datenübertragung
- ✅ **Anonymisierung**: Persönliche Daten werden automatisch entfernt
- ✅ **Löschbar**: Benutzer können alle Daten jederzeit löschen
- ✅ **Transparenz**: Alle getrackte Daten im Dashboard einsehbar

### 📊 Tracking-Funktionen
1. **Event-Tracking**: Benutzer-Interaktionen (Klicks, Navigation, etc.)
2. **Gameplay-Tracking**: Spielmodus, Kategorien, Antworten, Punkte
3. **Error-Tracking**: Automatische Fehler-Protokollierung
4. **Performance-Tracking**: Ladezeiten, Animation-Performance (optional)
5. **Session-Tracking**: Sitzungsdauer, Events pro Session

### 🎨 Admin-Dashboard
- Statistik-Übersicht (Total Events, Sessions, Fehler)
- Event-Kategorien Diagramm
- Top Actions Diagramm
- Detaillierte Event-Liste mit Filter
- Session-Historie
- Fehler-Log
- Einstellungen & Datenverwaltung

---

## 🏗️ Architektur

### Dateien
```
javascript/
├── analytics.js          # Core Engine (AnalyticsManager)
├── analytics-events.js   # Event-Definitionen (AnalyticsEvents)
└── analytics-ui.js       # Dashboard UI (AnalyticsDashboard)

stylesheets/
└── analytics.css         # Dashboard Styling
```

### Klassen

#### 1. AnalyticsManager (`analytics.js`)
**Verantwortlichkeit:** Core-Engine für Datenverarbeitung & Speicherung

**Hauptmethoden:**
- `enable()` / `disable()` - Opt-in / Opt-out
- `trackEvent(category, action, data)` - Event tracken
- `trackError(errorData)` - Fehler tracken
- `getStatistics()` - Statistiken berechnen
- `exportData()` - Daten exportieren
- `clearAllData()` - Alle Daten löschen

**Storage:**
- `keksi_analytics_data` - Event-Daten
- `keksi_analytics_settings` - Einstellungen
- `keksi_analytics_session` - Aktuelle Session

#### 2. AnalyticsEvents (`analytics-events.js`)
**Verantwortlichkeit:** Vordefinierte Event-Helper

**Event-Kategorien:**
- **Gameplay**: `gameStarted()`, `gameEnded()`, `questionAnswered()`, etc.
- **Navigation**: `screenViewed()`, `buttonClicked()`, `modalOpened()`, etc.
- **Settings**: `themeChanged()`, `soundToggled()`, etc.
- **Auth**: `userLoggedIn()`, `userLoggedOut()`, `permissionDenied()`, etc.
- **Editor**: `questionCreated()`, `questionEdited()`, etc.
- **Performance**: `pageLoadTime()`, `gameInitTime()`, etc.

#### 3. AnalyticsDashboard (`analytics-ui.js`)
**Verantwortlichkeit:** Admin-Dashboard UI

**Features:**
- Tab-basierte Navigation (Übersicht, Events, Sessions, Fehler, Einstellungen)
- Echtzeit-Statistiken mit Auto-Refresh
- Interaktive Bar-Charts
- Event-Filterung
- Datenexport (JSON)
- Einstellungsverwaltung

---

## 🚀 Verwendung

### 1. Analytics aktivieren (Opt-in)

**Im Spiel (Benutzer):**
1. Einstellungen öffnen
2. "Analytics aktivieren" Toggle anschalten
3. Fertig! Events werden nun getrackt

**Programmatisch:**
```javascript
// Aktivieren
window.analyticsManager.enable();

// Deaktivieren
window.analyticsManager.disable();

// Status prüfen
const isEnabled = window.analyticsManager.isEnabled();
```

### 2. Events tracken

**Vordefinierte Events verwenden (empfohlen):**
```javascript
// Game Start
window.analyticsEvents.gameStarted('single', ['IT', 'Netzwerk'], {
    playerCount: 2,
    timerEnabled: true
});

// Question Answered
window.analyticsEvents.questionAnswered('IT', 200, true, 15.3);

// Screen Navigation
window.analyticsEvents.screenViewed('game_screen');

// Button Click
window.analyticsEvents.buttonClicked('startGame', 'setup_screen');
```

**Custom Events:**
```javascript
// Manuell Event tracken
window.analyticsManager.trackEvent('custom', 'my_action', {
    someData: 'value',
    moreData: 123
});
```

### 3. Fehler-Tracking

**Automatisch:**
Alle `window.error` und `unhandledrejection` Events werden automatisch getrackt.

**Manuell:**
```javascript
// Custom Error
window.analyticsEvents.customError('validation', 'Invalid input', {
    field: 'playerName',
    value: ''
});

// Validation Error
window.analyticsEvents.validationError('email', 'format');
```

### 4. Performance-Tracking

```javascript
// Performance Metric
window.analyticsManager.trackPerformance('question_load', 234.5);

// Mit Messung
const result = window.analyticsManager.measurePerformance('initialize', () => {
    // Code hier
    return someResult;
});
```

### 5. Dashboard öffnen (Admin)

**Als Admin einloggen:**
1. Login mit Admin-Account (admin / admin123)
2. "📈 Analytics Dashboard" Button erscheint
3. Button klicken → Dashboard öffnet sich

**Programmatisch:**
```javascript
window.analyticsDashboard.open();
```

### 6. Daten exportieren

**Im Dashboard:**
1. Settings-Tab öffnen
2. "📥 Daten exportieren" klicken
3. JSON-Datei wird heruntergeladen

**Programmatisch:**
```javascript
const exportData = window.analyticsManager.exportData();
console.log(exportData);
```

### 7. Daten löschen

**Im Dashboard:**
1. Settings-Tab öffnen
2. "🗑️ Alle Daten löschen" klicken
3. Sicherheitsabfrage bestätigen

**Programmatisch:**
```javascript
window.analyticsManager.clearAllData();
```

---

## ⚙️ Einstellungen

```javascript
// Analytics Settings Objekt
{
    enabled: false,              // Analytics aktiviert?
    trackEvents: true,           // Event-Tracking
    trackErrors: true,           // Error-Tracking
    trackPerformance: false,     // Performance-Tracking
    anonymizeData: true,         // Daten anonymisieren (DSGVO!)
    retentionDays: 30            // Daten-Aufbewahrung (Tage)
}
```

**Ändern:**
```javascript
window.analyticsManager.settings.trackPerformance = true;
window.analyticsManager.saveSettings();
```

---

## 📈 Statistiken

### Statistik-Objekt

```javascript
const stats = window.analyticsManager.getStatistics();

// Struktur:
{
    totalEvents: 1234,
    sessionCount: 56,
    errorCount: 3,
    averageEventsPerSession: 22,
    
    categories: {
        'gameplay': {
            count: 500,
            actions: {
                'game_started': 10,
                'question_answered': 490
            }
        },
        // ...
    },
    
    sessions: {
        'session_xyz': {
            events: 45,
            start: '2025-01-15T10:00:00',
            end: '2025-01-15T10:30:00'
        },
        // ...
    },
    
    errors: [
        {
            timestamp: '2025-01-15T10:15:00',
            type: 'error',
            message: 'Cannot read property...'
        },
        // ...
    ],
    
    timeRange: {
        start: '2025-01-01T00:00:00',
        end: '2025-01-15T12:00:00'
    }
}
```

---

## 🔒 Datenschutz & DSGVO

### Was wird NICHT getrackt?
- ❌ Keine persönlichen Daten (Name, Email, etc.)
- ❌ Keine IP-Adressen
- ❌ Keine Cookies
- ❌ Keine externen Requests
- ❌ Keine User-IDs (nur anonyme Session-IDs)

### Was wird getrackt?
- ✅ Event-Kategorien & Actions (z.B. "button_clicked")
- ✅ Anonymisierte Event-Daten (z.B. "category: IT")
- ✅ Session-IDs (nur lokal gültig)
- ✅ Timestamps
- ✅ Fehler-Messages & Stack Traces
- ✅ Performance-Metriken (optional)

### Anonymisierung

**Sensible Felder werden automatisch entfernt:**
```javascript
// Vorher
{ 
    email: 'user@example.com',
    username: 'john_doe',
    category: 'IT'
}

// Nachher (anonymisiert)
{
    category: 'IT'
}
```

**Sensible Felder:**
- `email`, `username`, `password`, `ip`, `userId`, `name`

---

## 🧪 Testing

### Test-Events generieren

```javascript
// Test-Events
window.analyticsEvents.gameStarted('single', ['Test'], { test: true });
window.analyticsEvents.questionAnswered('Test', 100, true, 5);
window.analyticsEvents.screenViewed('test_screen');
window.analyticsEvents.buttonClicked('test_btn', 'test');

// Statistiken prüfen
console.log(window.analyticsManager.getStatistics());
```

### Debug-Modus

```javascript
// Events in Console loggen
window.analyticsManager.trackEvent = new Proxy(
    window.analyticsManager.trackEvent,
    {
        apply(target, thisArg, args) {
            console.log('📊 Event:', args);
            return target.apply(thisArg, args);
        }
    }
);
```

---

## 🐛 Troubleshooting

### Analytics funktioniert nicht

**1. Ist Analytics aktiviert?**
```javascript
console.log(window.analyticsManager.isEnabled()); // Sollte true sein
```

**2. Existiert analyticsManager?**
```javascript
console.log(window.analyticsManager); // Sollte nicht undefined sein
```

**3. Scripts geladen?**
```javascript
console.log(window.analyticsEvents); // Sollte nicht undefined sein
```

### Dashboard öffnet nicht

**1. Als Admin eingeloggt?**
```javascript
console.log(window.authManager.currentUser.role); // Sollte 'admin' sein
```

**2. Dashboard existiert?**
```javascript
console.log(window.analyticsDashboard); // Sollte nicht undefined sein
```

### LocalStorage voll

```javascript
// Alte Daten löschen
window.analyticsManager.cleanupOldDataAggressive();

// Oder alle Daten löschen
window.analyticsManager.clearAllData();
```

---

## 📝 Changelog

### Version 1.0 (Januar 2025)
- ✨ Initiales Release
- ✅ Core Analytics Engine
- ✅ Event-Tracking System
- ✅ Admin Dashboard
- ✅ DSGVO-Konformität
- ✅ Automatisches Error-Tracking
- ✅ Session-Management
- ✅ Datenexport
- ✅ Data Retention Policy

---

## 🔮 Zukünftige Features

### Geplant für v1.1:
- [ ] Benutzerdefinierte Dashboards
- [ ] Chart-Export (PNG/SVG)
- [ ] Erweiterte Filter-Optionen
- [ ] A/B-Testing Support
- [ ] Funnel-Analyse
- [ ] Heatmap-Tracking
- [ ] Real-time Event-Stream

### Geplant für v2.0:
- [ ] Cloud-Sync (optional, opt-in)
- [ ] Multi-Device Session-Tracking
- [ ] Advanced Analytics (Cohort-Analyse, etc.)
- [ ] Custom Event Builder UI
- [ ] Automated Insight Generation (AI)

---

## 📚 Weitere Ressourcen

- **DSGVO Info:** https://dsgvo-gesetz.de/
- **LocalStorage API:** https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Error Tracking Best Practices:** https://sentry.io/blog/error-tracking-best-practices

---

## 💬 Support

**Fragen? Probleme? Feedback?**
- Entwickler: Nico Kaschube
- Institution: Berufsbildungswerk im Oberlinhaus Potsdam
- Jahr: 2025

---

**Happy Tracking! 📊✨**
