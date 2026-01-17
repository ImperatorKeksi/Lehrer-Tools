/*
    ╔══════════════════════════════════════════════════╗
    ║  🔐 AUTHENTICATION - PHP Backend Integration    ║
    ║  OPTIMIERT FÜR LIVE-WEBSERVER                   ║
    ║                                                  ║ 
    ╚══════════════════════════════════════════════════╝
*/

class AuthManager {
    constructor() {
        // Rollen-Definitionen (synchron mit PHP-Backend)
        this.roles = {
            GUEST: 'schueler',
            TEACHER: 'lehrer',
            ADMIN: 'administrator'
        };
        
        // Berechtigungen pro Rolle
        this.permissions = {
            schueler: ['play', 'feedback'],
            lehrer: ['play', 'feedback', 'editor'],
            administrator: ['play', 'feedback', 'editor', 'stats', 'user_management']
        };
        
        // Aktuelle Session
        this.currentUser = null;
        
        this.debugMode = true;
        
        this.init();
    }
    
    init() {
        this.checkSession();
    }
    
    // =========================================================================
    // HELPER: Basis-Pfad ermitteln (VERBESSERT für Live-Server)
    // =========================================================================
    
    getBasePath() {
        // Hole die aktuelle URL
        const path = window.location.pathname;
        const host = window.location.origin;
        
        if (this.debugMode) {
            console.log('🌍 Current Path:', path);
            console.log('🏠 Host:', host);
        }
        
        // Prüfe ob wir in einem Unterordner sind
        // Beispiel: /seiten/dashboard.html -> gehe ein Level hoch
        if (path.includes('/seiten/')) {
            if (this.debugMode) console.log('📂 In /seiten/ - Base: ../');
            return '../';
        }
        
        // Direkt im Root
        if (this.debugMode) console.log('📂 Im Root - Base: ./');
        return './';
    }
    
    // Alternative: Absolute Pfade (SICHERER!)
    getAbsoluteAPIPath(endpoint) {
        // Nutze relative Pfade vom Root aus
        const currentPath = window.location.pathname;
        
        // Wenn wir in /seiten/ sind, gehe zurück zum Root
        if (currentPath.includes('/seiten/')) {
            return `../php/${endpoint}`;
        }
        
        // Sonst direkt
        return `php/${endpoint}`;
    }
    
    // =========================================================================
    // HELPER: JSON Response Parser mit BESSEREM Error Handling
    // =========================================================================
    
    async parseResponse(response, endpoint) {
        const contentType = response.headers.get('content-type');
        
        if (this.debugMode) {
            console.log(`📨 Response von ${endpoint}:`, {
                status: response.status,
                contentType: contentType,
                ok: response.ok
            });
        }
        
        // Prüfe ob Response wirklich JSON ist
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ ${endpoint} gibt kein JSON zurück:`, text.substring(0, 500));
            
            // Zeige hilfreiche Fehlermeldung
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                throw new Error(`❌ Server gibt HTML statt JSON zurück!\n\nMögliche Ursachen:\n• PHP-Fehler in ${endpoint}\n• .htaccess blockiert Zugriff\n• Datei nicht gefunden (404)\n\nPrüfe die Browser-Console für Details.`);
            }
            
            throw new Error(`Server-Fehler: Ungültige Antwort von ${endpoint}`);
        }
        
        try {
            const data = await response.json();
            
            if (this.debugMode) {
                console.log(`✅ JSON von ${endpoint}:`, data);
            }
            
            return data;
            
        } catch (error) {
            console.error(`❌ JSON Parse Error bei ${endpoint}:`, error);
            throw new Error('Server-Antwort konnte nicht verarbeitet werden.');
        }
    }
    
    // =========================================================================
    // SESSION MANAGEMENT (VERBESSERT)
    // =========================================================================
    
    async checkSession() {
        try {
            console.log('🔍 Prüfe Session...');
            
            const apiPath = this.getAbsoluteAPIPath('auth_check.php');
            
            if (this.debugMode) {
                console.log('🔗 API-URL:', apiPath);
            }
            
            const response = await fetch(apiPath, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                console.warn(`⚠️ Session-Check HTTP ${response.status}`);
                
                if (response.status === 404) {
                    console.error('❌ 404: PHP-Datei nicht gefunden!', apiPath);
                    alert(`FEHLER: auth_check.php nicht gefunden!\n\nErwartet unter: ${apiPath}\n\nPrüfe:\n• Ist die Datei hochgeladen?\n• Stimmt der Pfad?\n• Hat der Server PHP aktiviert?`);
                }
                
                this.currentUser = null;
                this.updateUI();
                return;
            }
            
            const data = await this.parseResponse(response, 'auth_check.php');
            
            if (data.logged_in && data.user) {
                this.currentUser = {
                    userId: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    role: data.user.role
                };
                console.log('✅ Session aktiv:', this.currentUser.username, `(${this.currentUser.role})`);
            } else {
                this.currentUser = null;
                console.log('👤 Nicht eingeloggt');
            }
            
            this.updateUI();
            
        } catch (error) {
            console.error('❌ Session-Check fehlgeschlagen:', error);
            
            // Zeige Fehler nur im Debug-Modus
            if (this.debugMode) {
                alert(`Session-Check Fehler:\n\n${error.message}\n\nÖffne die Browser-Console (F12) für Details.`);
            }
            
            this.currentUser = null;
            this.updateUI();
        }
    }
    
    // =========================================================================
    // AUTHENTICATION
    // =========================================================================
    
    async login(username, password) {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            console.log('🔐 Login-Versuch für:', username);
            
            const apiPath = this.getAbsoluteAPIPath('login.php');
            
            const response = await fetch(apiPath, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (this.debugMode) {
                console.log('📨 Login Response Status:', response.status);
            }
            
            const data = await this.parseResponse(response, 'login.php');
            
            if (data.success && data.user) {
                this.currentUser = {
                    userId: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    role: data.user.role
                };
                this.updateUI();
                this.logAudit('login', username);
                console.log('✅ Login erfolgreich:', this.currentUser.username);
                return {
                    success: true,
                    user: this.currentUser,
                    message: data.message || 'Login erfolgreich!'
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Login fehlgeschlagen'
                };
            }
        } catch (error) {
            console.error('❌ Login-Fehler:', error);
            return {
                success: false,
                error: error.message || 'Verbindungsfehler. Bitte versuche es erneut.'
            };
        }
    }
    
    async register(username, email, password, passwordConfirm) {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('password_confirm', passwordConfirm);
            
            console.log('📝 Registrierung für:', username);
            
            const apiPath = this.getAbsoluteAPIPath('register.php');
            
            const response = await fetch(apiPath, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const data = await this.parseResponse(response, 'register.php');
            
            if (data.success) {
                this.logAudit('register', username);
                
                return {
                    success: true,
                    message: data.message || 'Registrierung erfolgreich!'
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Registrierung fehlgeschlagen'
                };
            }
            
        } catch (error) {
            console.error('❌ Registrierungs-Fehler:', error);
            return {
                success: false,
                error: error.message || 'Verbindungsfehler. Bitte versuche es erneut.'
            };
        }
    }
    
    async logout() {
        try {
            if (this.currentUser) {
                this.logAudit('logout', this.currentUser.username);
            }
            
            const apiPath = this.getAbsoluteAPIPath('logout.php');
            
            await fetch(apiPath, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            this.currentUser = null;
            this.updateUI();
            
            console.log('✅ Logout erfolgreich');
            
            // Optional: Zur Startseite weiterleiten
            // window.location.href = '/';
            
        } catch (error) {
            console.error('❌ Logout-Fehler:', error);
            // Trotzdem UI updaten
            this.currentUser = null;
            this.updateUI();
        }
    }
    
    // =========================================================================
    // AUTHORIZATION & PERMISSIONS
    // =========================================================================
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getRole() {
        return this.currentUser ? this.currentUser.role : 'schueler';
    }
    
    hasPermission(permission) {
        const role = this.getRole();
        const rolePermissions = this.permissions[role] || this.permissions.schueler;
        return rolePermissions.includes(permission);
    }
    
    canAccessEditor() {
        return this.hasPermission('editor');
    }
    
    canAccessStats() {
        return this.hasPermission('stats');
    }
    
    canManageUsers() {
        return this.hasPermission('user_management');
    }
    
    // =========================================================================
    // UI UPDATES
    // =========================================================================
    
    updateUI() {
        // Sammle alle bekannten Button-/Display-IDs
        const loginIds = ['loginBtn','loginBtnNav','loginBtnGame','loginBtnAR','loginBtnNR','loginBtnSLF','loginBtnDB','loginBtnTimer','loginBtnZG'];
        const logoutIds = ['logoutBtn','logoutBtnNav','logoutBtnGame','logoutBtnAR','logoutBtnNR','logoutBtnSLF','logoutBtnDB','logoutBtnTimer','logoutBtnZG'];
        const userDisplayIds = ['userDisplay','userDisplayNav','userDisplayGame','userDisplayAR','userDisplayNR','userDisplaySLF','userDisplayDB','userDisplayTimer','userDisplayZG'];

        const logins = loginIds.map(id => document.getElementById(id)).filter(Boolean);
        const logouts = logoutIds.map(id => document.getElementById(id)).filter(Boolean);
        const displays = userDisplayIds.map(id => document.getElementById(id)).filter(Boolean);

        if (this.isLoggedIn()) {
            logins.forEach(el => el.style.display = 'none');
            logouts.forEach(el => el.style.display = 'inline-flex');
            displays.forEach(el => {
                el.style.display = 'inline-flex';
                el.textContent = `👤 ${this.currentUser.username}`;
                el.title = `Rolle: ${this.getRoleLabel(this.currentUser.role)}`;
            });
        } else {
            logins.forEach(el => el.style.display = 'inline-flex');
            logouts.forEach(el => el.style.display = 'none');
            displays.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Feature-Buttons aktualisieren
        this.updateFeatureButtons();
        
        // Profil-Navigation binden
        this.bindProfileNavigation();
    }
    
    bindProfileNavigation() {
        try {
            const profileEls = Array.from(document.querySelectorAll('[id^="userDisplay"]'));
            profileEls.forEach(el => {
                if (el._dashboardBound) return;
                el._dashboardBound = true;
                el.style.cursor = 'pointer';
                el.addEventListener('click', (e) => {
                    if (!this.isLoggedIn()) return;
                    const inSeiten = window.location.pathname.includes('/seiten/');
                    const target = inSeiten ? 'dashboard.html' : 'seiten/dashboard.html';
                    window.location.href = target;
                });
            });
        } catch (e) {
            console.warn('⚠️ Konnte Profil-Navigation nicht binden:', e);
        }
    }
    
    updateFeatureButtons() {
        // Editor Button
        const editorBtn = document.getElementById('openEditorBtn');
        if (editorBtn) {
            if (this.canAccessEditor()) {
                editorBtn.style.display = 'inline-flex';
                editorBtn.disabled = false;
            } else {
                editorBtn.style.display = 'none';
            }
        }
        
        // Stats Button
        const statsBtn = document.getElementById('openStatsBtn');
        if (statsBtn) {
            if (this.canAccessStats()) {
                statsBtn.style.display = 'inline-flex';
                statsBtn.disabled = false;
            } else {
                statsBtn.style.display = 'none';
            }
        }
        
        // Analytics Button (nur für Admins)
        const analyticsBtn = document.getElementById('openAnalyticsBtn');
        if (analyticsBtn) {
            if (this.currentUser && this.currentUser.role === 'administrator') {
                analyticsBtn.style.display = 'inline-flex';
                analyticsBtn.disabled = false;
            } else {
                analyticsBtn.style.display = 'none';
            }
        }
    }
    
    getRoleLabel(role) {
        const labels = {
            schueler: 'Schüler',
            lehrer: 'Lehrer',
            administrator: 'Administrator'
        };
        return labels[role] || 'Unbekannt';
    }
    
    // =========================================================================
    // AUDIT LOG (localStorage für Client-Seite)
    // =========================================================================
    
    logAudit(action, username) {
        try {
            const auditLog = JSON.parse(localStorage.getItem('jeopardy_audit_log') || '[]');
            auditLog.push({
                action,
                username,
                timestamp: new Date().toISOString(),
                role: this.getRole()
            });
            
            // Behalte nur die letzten 100 Einträge
            if (auditLog.length > 100) {
                auditLog.shift();
            }
            
            localStorage.setItem('jeopardy_audit_log', JSON.stringify(auditLog));
        } catch (error) {
            console.warn('⚠️ Audit-Log konnte nicht gespeichert werden:', error);
        }
    }
}

// ============================================================================= 
// INITIALIZE AUTH MANAGER                                                     
// ============================================================================= 

let authManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authManager = new AuthManager();
        window.authManager = authManager;
        console.log('✅ AuthManager initialisiert');
    });
} else {
    authManager = new AuthManager();
    window.authManager = authManager;
    console.log('✅ AuthManager initialisiert');
}