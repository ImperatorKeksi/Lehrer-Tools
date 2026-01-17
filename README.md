
<p align="center">
	<img src="icons/logo-simple.svg" width="120" alt="Lehrer Tools Logo"/>
</p>

# 🎓 Lehrer Tools – Digitale Unterrichts-Tools

> **Interaktive, barrierefreie & DSGVO-konforme Tools für Lehrer:innen und Azubis**<br>
> _Jeopardy-Quiz, Timer, Stadt-Land-Fluss, Notenrechner, Aufgabenroulette & mehr_

---

## 📚 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Features](#features)
3. [Sprachen & Code-Statistik](#sprachen--code-statistik)
4. [Tool-Übersicht](#tool-übersicht)
5. [Voraussetzungen](#voraussetzungen)
6. [Installation](#installation)
7. [Nutzung](#nutzung)
8. [Projektstruktur](#projektstruktur)
9. [Konfiguration](#konfiguration)
10. [Fehlerbehebung](#fehlerbehebung)
11. [Mitwirken](#mitwirken)
12. [Lizenz](#lizenz)
13. [Autor](#autor)

---

## 1. Überblick

<p align="center">
	<img src="https://img.shields.io/badge/DSGVO-konform-%E2%9C%85-9d4edd?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/Barrierefrei-WCAG%202.1%20AA-38ef7d?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/PWA-Ready-ffbe0b?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/100%25%20Clientside-JavaScript-blueviolet?style=for-the-badge"/>
</p>

Lehrer Tools ist eine moderne, modulare Web-App für den Unterricht. Alle Tools laufen **vollständig im Browser** (kein Backend nötig) und speichern Daten lokal. Ideal für Schulen, Azubis, Seminare & Workshops.

---

## 2. Features

| 🚀 | **Feature**                        |  
|-----|------------------------------------|
| 🎮  | Jeopardy-Quizspiel (mit Editor)    |
| 🎲  | Aufgabenroulette & Zufallsgenerator|
| 🏙️  | Stadt-Land-Fluss (digital)         |
| 🧮  | Notenrechner (verschiedene Arten)  |
| ⏰  | Timer/Uhr für den Unterricht       |
| 📊  | Analytics-Dashboard (lokal, opt-in)|
| 🏠  | Dashboard & Favoriten              |
| 🦾  | Barrierefreiheit (WCAG 2.1 AA)     |
| 📱  | Responsive Design                  |
| 🖼️  | PWA: offlinefähig & installierbar  |
| 🗂️  | Fragenkataloge (Standard, IT, usw.)|
| 🔒  | Authentifizierung (Frontend)       |

---

## 3. Sprachen & Code-Statistik

| Sprache         | Dateien | Zeilen (ca.) |
|-----------------|---------|--------------|
| JavaScript      |   18    |   16.000     |
| CSS             |   12    |   4.000      |
| HTML            |   10    |   7.000      |
| Fragenkataloge  |    2    |   200        |
| Dokumentation   |    7    |   1.500      |

---

## 4. Tool-Übersicht

| 🗂️ Tool              | Datei                        | Hauptsprache | Zeilen | Beschreibung                                  |
|----------------------|------------------------------|--------------|--------|-----------------------------------------------|
| 🎮 Jeopardy-Quiz     | seiten/game.html             | JS/HTML/CSS  | 1.400  | Interaktives Quizspiel mit Editor & Katalogen |
| 🎲 Aufgabenroulette  | seiten/aufgabenroulette.html | JS/HTML/CSS  | 1.000  | Zufallsaufgaben, Gruppen, Würfel, Glücksrad   |
| 🏙️ Stadt-Land-Fluss | seiten/stadt-land-fluss.html | JS/HTML/CSS  | 800    | Digitales Stadt-Land-Fluss-Spiel              |
| 🧮 Notenrechner      | seiten/notenrechner.html     | JS/HTML/CSS  | 700    | Notenberechnung (versch. Methoden)            |
| ⏰ Timer             | seiten/timer.html            | JS/HTML/CSS  | 850    | Uhr, Timer, Countdowns                        |
| 🎲 Zufallsgenerator  | seiten/zufallsgenerator.html | JS/HTML/CSS  | 1.200  | Schülerauswahl, Teams, Würfel, Münze, Rad     |
| 🏠 Dashboard         | seiten/dashboard.html        | JS/HTML/CSS  | 900    | Favoriten, Schnellzugriff, Analytics          |
| 🏁 Startseite        | seiten/start.html            | JS/HTML/CSS  | 1.700  | Übersicht & Einstieg                          |

---

## 5. Voraussetzungen

- Node.js (empfohlen für Build/Minify)
- npm (empfohlen für Build/Minify)
- Empfohlen: Live Server Extension (für Entwicklung)
- **Kein Backend nötig!**

---

## 6. Installation

**Entwicklung (Frontend):**
1. Repository klonen
2. Mit Live Server Extension `seiten/start.html` öffnen

**Production Build:**
```bash
cd config
npm install
npm run build
npm run preview
```

---

## 7. Nutzung

- Startseite: `seiten/start.html` oder `index.html`
- Tools über das Dashboard oder Direktlinks aufrufen
- Eigene Fragenkataloge im Editor erstellen
- Analytics und Einstellungen im Dashboard verwalten
- Authentifizierung für geschützte Bereiche nutzen

---

## 8. Projektstruktur

```text
├── index.html              # Hauptstartseite
├── seiten/                 # Einzelne Tools (game, timer, ...)
├── javascript/             # Alle JS-Module (Spiel, UI, Analytics, ...)
├── stylesheets/            # Zentrale CSS-Dateien
├── fragenkataloge/         # Fragen-Datenbanken (JS)
├── pwa/                    # Manifest & Service Worker
├── tools/                  # Build- und Minify-Skripte
├── docs/                   # Dokumentation
├── icons/                  # Logos & App-Icons
```

---

## 9. Konfiguration

- `config/vite.config.js` – Build-Konfiguration (Vite)
- `.htaccess` – Rewrite- und Sicherheitsregeln (Apache)
- `pwa/manifest.json` – PWA-Konfiguration

---

## 10. Fehlerbehebung

- Bei Build-Problemen: Node.js-Version prüfen, `npm install` erneut ausführen
- Bei PWA-Problemen: Browser-Cache leeren, HTTPS nutzen

---

## 11. Mitwirken

- Pull Requests & Issues willkommen!
- Bitte Code-Kommentare und Dokumentation beachten
- Feedback & Feature-Wünsche gerne als Issue einreichen

---

## 12. Lizenz

ISC-Lizenz (siehe package.json) – Keine weitere Lizenz definiert

---

## 13. Autor

<img src="https://avatars.githubusercontent.com/u/18144800?v=4" width="64" align="left" style="border-radius:50%;margin-right:1rem;"/>
**Nico Kaschube**  
GitHub: [ImperatorKeksi](https://github.com/ImperatorKeksi)

---

## 🇬🇧 English (see below)

<details>
<summary>Show English version</summary>

<p align="center">
	<img src="icons/logo-simple.svg" width="120" alt="Lehrer Tools Logo"/>
</p>

# 🎓 Lehrer Tools – Digital Teaching Tools

> **Interactive, accessible & GDPR-compliant tools for teachers and trainees**<br>
> _Jeopardy quiz, timer, city-country-river, grade calculator, task roulette & more_

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features-1)
3. [Languages & Code Stats](#languages--code-stats)
4. [Tool Overview](#tool-overview)
5. [Requirements](#requirements)
6. [Installation](#installation-1)
7. [Usage](#usage)
8. [Project Structure](#project-structure)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [License](#license)
13. [Author](#author)

---

## 1. Overview

<p align="center">
	<img src="https://img.shields.io/badge/GDPR-compliant-%E2%9C%85-9d4edd?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/Accessible-WCAG%202.1%20AA-38ef7d?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/PWA-Ready-ffbe0b?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/100%25%20Clientside-JavaScript-blueviolet?style=for-the-badge"/>
</p>

Lehrer Tools is a modern, modular web app for teaching. All tools run **entirely in the browser** (no backend required) and store data locally. Ideal for schools, trainees, seminars & workshops.

---

## 2. Features

| 🚀 | **Feature**                        |  
|-----|------------------------------------|
| 🎮  | Jeopardy quiz game (with editor)   |
| 🎲  | Task roulette & random generator   |
| 🏙️  | City-country-river (digital)       |
| 🧮  | Grade calculator (various types)   |
| ⏰  | Timer/clock for lessons            |
| 📊  | Analytics dashboard (local, opt-in)|
| 🏠  | Dashboard & favorites              |
| 🦾  | Accessibility (WCAG 2.1 AA)        |
| 📱  | Responsive design                  |
| 🖼️  | PWA: offline-capable & installable |
| 🗂️  | Question catalogs (standard, IT...)|
| 🔒  | Authentication (frontend)          |

---

## 3. Languages & Code Stats

| Language        | Files  | Lines (approx.) |
|-----------------|--------|-----------------|
| JavaScript      |   18   |   16,000        |
| CSS             |   12   |   4,000         |
| HTML            |   10   |   7,000         |
| Question Sets   |    2   |   200           |
| Documentation   |    7   |   1,500         |

---

## 4. Tool Overview

| 🗂️ Tool              | File                         | Main Lang. | Lines | Description                                   |
|----------------------|------------------------------|------------|-------|-----------------------------------------------|
| 🎮 Jeopardy Quiz     | seiten/game.html             | JS/HTML/CSS| 1,400 | Interactive quiz game with editor & catalogs   |
| 🎲 Task Roulette     | seiten/aufgabenroulette.html | JS/HTML/CSS| 1,000 | Random tasks, groups, dice, wheel             |
| 🏙️ City-Country-River| seiten/stadt-land-fluss.html | JS/HTML/CSS| 800   | Digital city-country-river game               |
| 🧮 Grade Calculator  | seiten/notenrechner.html     | JS/HTML/CSS| 700   | Grade calculation (various methods)           |
| ⏰ Timer             | seiten/timer.html            | JS/HTML/CSS| 850   | Clock, timer, countdowns                      |
| 🎲 Random Generator  | seiten/zufallsgenerator.html | JS/HTML/CSS| 1,200 | Student picker, teams, dice, coin, wheel      |
| 🏠 Dashboard         | seiten/dashboard.html        | JS/HTML/CSS| 900   | Favorites, quick access, analytics            |
| 🏁 Start Page        | seiten/start.html            | JS/HTML/CSS| 1,700 | Overview & entry point                        |

---

## 5. Requirements

- Node.js (recommended for build/minify)
- npm (recommended for build/minify)
- Recommended: Live Server Extension (for development)
- **No backend required!**

---

## 6. Installation

**Development (Frontend):**
1. Clone the repository
2. Open `seiten/start.html` with Live Server Extension

**Production Build:**
```bash
cd config
npm install
npm run build
npm run preview
```

---

## 7. Usage

- Start page: `seiten/start.html` or `index.html`
- Access tools via dashboard or direct links
- Create your own question catalogs in the editor
- Manage analytics and settings in the dashboard
- Use authentication for protected areas

---

## 8. Project Structure

```text
├── index.html              # Main start page
├── seiten/                 # Individual tools (game, timer, ...)
├── javascript/             # All JS modules (game, UI, analytics, ...)
├── stylesheets/            # Central CSS files
├── fragenkataloge/         # Question databases (JS)
├── pwa/                    # Manifest & service worker
├── tools/                  # Build and minify scripts
├── docs/                   # Documentation
├── icons/                  # Logos & app icons
```

---

## 9. Configuration

- `config/vite.config.js` – Build configuration (Vite)
- `.htaccess` – Rewrite and security rules (Apache)
- `pwa/manifest.json` – PWA configuration

---

## 10. Troubleshooting

- For build issues: Check Node.js version, run `npm install` again
- For PWA issues: Clear browser cache, use HTTPS

---

## 11. Contributing

- Pull requests & issues welcome!
- Please follow code comments and documentation
- Feedback & feature requests welcome via issues

---

## 12. License

ISC License (see package.json) – No further license defined

---

## 13. Author

<img src="https://avatars.githubusercontent.com/u/18144800?v=4" width="64" align="left" style="border-radius:50%;margin-right:1rem;"/>
**Nico**  
GitHub: [ImperatorKeksi](https://github.com/ImperatorKeksi)

</details>
