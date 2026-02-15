/*
    ╔══════════════════════════════════════════════════╗
    ║  🔐 AUTHENTICATION - PHP Backend Integration    ║
    ║  OPTIMIERT FÜR LIVE-WEBSERVER                   ║
    ║  FIXED: Besseres Error Handling                 ║
    ╚══════════════════════════════════════════════════╝
*/

class AuthManager {
    constructor() {
        this.roles = {
            GUEST: 'schueler',
            TEACHER: 'lehrer',
            ADMIN: 'administrator'
        };

        this.permissions = {
            schueler: ['play', 'feedback'],
            lehrer: ['play', 'feedback', 'editor'],
            administrator: ['play', 'feedback', 'editor', 'stats', 'user_management']
        };

        this.currentUser = null;
        this.debugMode = true;

        this.init();
    }

    init() {
        this.checkSession();
    }

    // =========================================================================
    // HELPER: Basis-Pfad ermitteln
    // =========================================================================

    getBasePath() {
        const path = window.location.pathname;
        const host = window.location.origin;

        if (this.debugMode) {
            console.log('🌍 Current Path:', path);
            console.log('🏠 Host:', host);
        }

        if (path.includes('/seiten/')) {
            if (this.debugMode) console.log('📂 In /seiten/ - Base: ../');
            return '../';
        }

        if (this.debugMode) console.log('📂 Im Root - Base: ./');
        return './';
    }

    getAbsoluteAPIPath(endpoint) {
        const currentPath = window.location.pathname;

        if (currentPath.includes('/seiten/')) {
            return `../php/${endpoint}`;
        }

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

        // Hole den Response-Text (damit wir ihn mehrmals nutzen können)
        const responseText = await response.text();

        if (this.debugMode) {
            console.log(`📄 Response Text (erste 500 Zeichen):`, responseText.substring(0, 500));
        }

        // Prüfe ob Response HTML ist
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            console.error(`❌ ${endpoint} gibt HTML zurück:`, responseText.substring(0, 1000));

            // Versuche PHP-Fehler zu extrahieren
            const errorMatch = responseText.match(/<b>([^<]+)<\/b>/);
            const fileMatch = responseText.match(/in <b>([^<]+)<\/b>/);
            const lineMatch = responseText.match(/on line <b>(\d+)<\/b>/);

            let errorMsg = `Server gibt HTML statt JSON zurück!\n\n`;

            if (errorMatch) {
                errorMsg += `PHP-Fehler: ${errorMatch[1]}\n`;
            }
            if (fileMatch) {
                errorMsg += `Datei: ${fileMatch[1]}\n`;
            }
            if (lineMatch) {
                errorMsg += `Zeile: ${lineMatch[1]}\n`;
            }

            errorMsg += `\nMögliche Ursachen:\n`;
            errorMsg += `• PHP-Syntax-Fehler in ${endpoint}\n`;
            errorMsg += `• Fehlende PHP-Extension (z.B. mbstring)\n`;
            errorMsg += `• Class not found (z.B. PHPMailer)\n`;
            errorMsg += `\nPrüfe die Browser-Console für Details.`;

            throw new Error(errorMsg);
        }

        // Prüfe ob Response leer ist
        if (!responseText || responseText.trim().length === 0) {
            console.error(`❌ ${endpoint} gibt leere Antwort zurück`);
            throw new Error('Server-Antwort ist leer');
        }

        // Versuche JSON zu parsen
        try {
            const data = JSON.parse(responseText);

            if (this.debugMode) {
                console.log(`✅ JSON von ${endpoint}:`, data);
            }

            return data;

        } catch (parseError) {
            console.error(`❌ JSON Parse Error bei ${endpoint}:`, parseError);
            console.error('Response Text war:', responseText);

            // Zeige hilfreichen Fehler
            throw new Error(`Server-Antwort konnte nicht verarbeitet werden.\n\nResponse beginnt mit: "${responseText.substring(0, 100)}..."\n\nJSON Parse Error: ${parseError.message}`);
        }
    }

    // =========================================================================
    // SESSION MANAGEMENT
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
                    display_name: data.user.display_name,
                    email: data.user.email,
                    role: data.user.role,
                    profileImg: this.fixLocalAssetPath(data.user.profile_img)
                };
                console.log('✅ Session aktiv:', this.currentUser.username, `(${this.currentUser.role})`);
            } else {
                this.currentUser = null;
                console.log('👤 Nicht eingeloggt');
            }

            this.updateUI();

        } catch (error) {
            console.error('❌ Session-Check fehlgeschlagen:', error);

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
                    display_name: data.user.display_name,
                    email: data.user.email,
                    role: data.user.role,
                    profileImg: this.fixLocalAssetPath(data.user.profile_img)
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
            console.log('🔗 Register API Path:', apiPath);

            const response = await fetch(apiPath, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('📨 Register Response Status:', response.status);

            // WICHTIG: Versuche Response zu parsen, auch bei Fehler
            try {
                const data = await this.parseResponse(response, 'register.php');

                if (data.success) {
                    this.logAudit('register', username);

                    return {
                        success: true,
                        message: data.message || 'Registrierung erfolgreich!',
                        requiresVerification: data.requiresVerification || false
                    };
                } else {
                    return {
                        success: false,
                        error: data.message || 'Registrierung fehlgeschlagen'
                    };
                }
            } catch (parseError) {
                // Wenn Response-Parsing fehlschlägt, zeige hilfreiche Fehlermeldung
                console.error('❌ Register Response Parse Error:', parseError);

                return {
                    success: false,
                    error: `Server-Fehler beim Registrieren.\n\n${parseError.message}\n\nPrüfe:\n• register.php auf PHP-Fehler\n• PHPMailer installiert?\n• Server-Logs`
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

        } catch (error) {
            console.error('❌ Logout-Fehler:', error);
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
        const loginIds = ['loginBtn', 'loginBtnNav', 'loginBtnGame', 'loginBtnAR', 'loginBtnNR', 'loginBtnSLF', 'loginBtnDB', 'loginBtnTimer', 'loginBtnZG'];
        const logoutIds = ['logoutBtn', 'logoutBtnNav', 'logoutBtnGame', 'logoutBtnAR', 'logoutBtnNR', 'logoutBtnSLF', 'logoutBtnDB', 'logoutBtnTimer', 'logoutBtnZG'];
        const userDisplayIds = ['userDisplay', 'userDisplayNav', 'userDisplayGame', 'userDisplayAR', 'userDisplayNR', 'userDisplaySLF', 'userDisplayDB', 'userDisplayTimer', 'userDisplayZG'];

        const logins = loginIds.map(id => document.getElementById(id)).filter(Boolean);
        const logouts = logoutIds.map(id => document.getElementById(id)).filter(Boolean);
        const displays = userDisplayIds.map(id => document.getElementById(id)).filter(Boolean);

        if (this.isLoggedIn()) {
            logins.forEach(el => el.style.display = 'none');
            logouts.forEach(el => el.style.display = 'inline-flex');
            displays.forEach(el => {
                el.style.display = 'inline-flex';
                el.style.alignItems = 'center';
                el.style.gap = '10px';
                el.style.padding = '0.5rem 1rem';
                el.style.background = 'rgba(157, 78, 221, 0.15)';
                el.style.borderRadius = '2rem';
                el.style.border = '1px solid rgba(157, 78, 221, 0.2)';
                el.style.transition = 'all 0.3s ease';

                // Profilbild oder Initialen-Avatar generieren
                const displayName = this.currentUser.display_name || this.currentUser.username;
                const avatarUrl = this.currentUser.profileImg || this.createUserAvatar(displayName);

                el.innerHTML = `
                    <div class="user-avatar-container" style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; background: linear-gradient(45deg, #9d4edd, #c77dff); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(157, 78, 221, 0.4); border: 1.5px solid rgba(255,255,255,0.2);">
                        <img src="${avatarUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${this.createUserAvatar(displayName)}'">
                    </div>
                    <span class="user-name-header" style="font-weight: 600; color: #fff; letter-spacing: 0.3px;">${displayName}</span>
                `;

                // Hover Effekt direkt per JS (da CSS-Klasse evtl. fehlt)
                el.onmouseenter = () => {
                    el.style.background = 'rgba(157, 78, 221, 0.25)';
                    el.style.transform = 'translateY(-1px)';
                    el.style.boxShadow = '0 4px 12px rgba(157, 78, 221, 0.15)';
                };
                el.onmouseleave = () => {
                    el.style.background = 'rgba(157, 78, 221, 0.15)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                };

                el.title = `Eingeloggt als ${displayName} (${this.getRoleLabel(this.currentUser.role)})`;
            });
        } else {
            logins.forEach(el => el.style.display = 'inline-flex');
            logouts.forEach(el => el.style.display = 'none');
            displays.forEach(el => {
                el.style.display = 'none';
            });
        }

        this.updateFeatureButtons();
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
        const editorBtn = document.getElementById('openEditorBtn');
        if (editorBtn) {
            if (this.canAccessEditor()) {
                editorBtn.style.display = 'inline-flex';
                editorBtn.disabled = false;
            } else {
                editorBtn.style.display = 'none';
            }
        }

        const statsBtn = document.getElementById('openStatsBtn');
        if (statsBtn) {
            if (this.canAccessStats()) {
                statsBtn.style.display = 'inline-flex';
                statsBtn.disabled = false;
            } else {
                statsBtn.style.display = 'none';
            }
        }

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
    // AUDIT LOG
    // =========================================================================

    // =========================================================================
    // UI HELPERS
    // =========================================================================

    createUserAvatar(username) {
        if (!username) return '';
        const firstLetter = encodeURIComponent(username.charAt(0).toUpperCase());
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%239d4edd' width='100' height='100' rx='50'/%3E%3Ctext x='50' y='50' font-size='45' text-anchor='middle' dy='.35em' fill='white' font-weight='bold' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
    }

    fixLocalAssetPath(path) {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;

        const base = this.getBasePath();
        // Pfad bereinigen
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        if (cleanPath.includes('seiten/')) cleanPath = cleanPath.replace('seiten/', '');

        // Wenn wir in /seiten/ sind und der Pfad assets enthält, brauchen wir ../
        if (base === '../' && !cleanPath.startsWith('../')) {
            return base + (cleanPath.startsWith('assets/') ? cleanPath : 'assets/' + cleanPath);
        }

        return base + cleanPath;
    }

    logAudit(action, username) {
        try {
            const auditLog = JSON.parse(localStorage.getItem('jeopardy_audit_log') || '[]');
            auditLog.push({
                action,
                username,
                timestamp: new Date().toISOString(),
                role: this.getRole()
            });

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