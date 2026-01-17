/*
    +--------------------------------------------------+
    |  🎨 AUTH UI - Login/Register Modal              |
    |  Benutzeroberfläche für PHP-Backend             |
    |  MIT E-MAIL VERIFICATION SUPPORT                |
    +--------------------------------------------------+
*/

class AuthUI {
    constructor() {
        this.loginModal = null;
        this.currentTab = 'login';
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.loginModal = document.getElementById('loginModal');
        this.bindEvents();
        this.setupPasswordToggles();
        console.log('🎨 Auth UI initialized');
    }
    
    bindEvents() {
        // Open/Close Login Modal
        const loginBtns = document.querySelectorAll('[id^="loginBtn"]');
        loginBtns.forEach(btn => {
            if (btn.id === 'submitLoginBtn') return; // Skip Submit-Button
            if (btn._loginBound) return;
            btn._loginBound = true;
            btn.addEventListener('click', () => this.openLoginModal());
        });
        
        const closeBtn = document.getElementById('closeLoginBtn');
        const cancelBtn = document.getElementById('cancelLoginBtn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeLoginModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeLoginModal());
        
        // Logout Buttons
        const logoutBtns = document.querySelectorAll('[id^="logoutBtn"]');
        logoutBtns.forEach(btn => {
            if (btn._logoutBound) return;
            btn._logoutBound = true;
            btn.addEventListener('click', () => this.handleLogout());
        });
        
        // Tab Switching
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Form Submissions
        const submitLoginBtn = document.getElementById('submitLoginBtn');
        const submitRegisterBtn = document.getElementById('submitRegisterBtn');
        
        if (submitLoginBtn) {
            submitLoginBtn.addEventListener('click', () => this.handleLogin());
        }
        if (submitRegisterBtn) {
            submitRegisterBtn.addEventListener('click', () => this.handleRegister());
        }
        
        // Enter key submit
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLogin();
                }
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleRegister();
                }
            });
        }
        
        // Modal schließen bei Klick außerhalb
        if (this.loginModal) {
            this.loginModal.addEventListener('click', (e) => {
                if (e.target === this.loginModal) {
                    this.closeLoginModal();
                }
            });
        }
        
        // ESC zum Schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.loginModal && !this.loginModal.classList.contains('hidden')) {
                this.closeLoginModal();
            }
        });
    }
    
    setupPasswordToggles() {
        this.setupPasswordToggle('toggleLoginPassword', 'loginPassword');
        this.setupPasswordToggle('toggleRegisterPassword', 'registerPassword');
        this.setupPasswordToggle('toggleRegisterPasswordConfirm', 'registerPasswordConfirm');
    }
    
    setupPasswordToggle(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        
        if (toggle && input) {
            toggle.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.textContent = '🙈';
                    toggle.title = 'Passwort verbergen';
                } else {
                    input.type = 'password';
                    toggle.textContent = '👁️';
                    toggle.title = 'Passwort anzeigen';
                }
            });
        }
    }
    
    // =========================================================================
    // MODAL MANAGEMENT
    // =========================================================================
    
    openLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.remove('hidden');
            this.switchTab('login');
            this.clearMessages();
            this.clearForms();
            
            // Fokus auf erstes Input
            setTimeout(() => {
                const firstInput = document.getElementById('loginUsername');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }
    
    closeLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.add('hidden');
            this.clearForms();
            this.clearMessages();
        }
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Show/hide forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const submitLoginBtn = document.getElementById('submitLoginBtn');
        const submitRegisterBtn = document.getElementById('submitRegisterBtn');
        
        if (tab === 'login') {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (submitLoginBtn) submitLoginBtn.style.display = 'inline-flex';
            if (submitRegisterBtn) submitRegisterBtn.style.display = 'none';
        } else {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (submitLoginBtn) submitLoginBtn.style.display = 'none';
            if (submitRegisterBtn) submitRegisterBtn.style.display = 'inline-flex';
        }
        
        this.clearMessages();
    }
    
    // =========================================================================
    // AUTHENTICATION HANDLERS
    // =========================================================================
    
    async handleLogin() {
        const username = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        
        if (!username || !password) {
            this.showError('login', 'Bitte fülle alle Felder aus!');
            return;
        }
        
        const submitBtn = document.getElementById('submitLoginBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Anmeldung läuft...';
        }
        
        try {
            const result = await window.authManager.login(username, password);
            
            if (result.success) {
                this.showSuccess('login', `✅ Willkommen ${result.user.username}!`);
                this.showConfetti();
                
                setTimeout(() => {
                    this.closeLoginModal();
                }, 1500);
            } else {
                this.showError('login', result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login', 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '🔓 Anmelden';
            }
        }
    }
    
    async handleLogout() {
        if (confirm('Möchtest du dich wirklich abmelden?')) {
            await window.authManager.logout();
            
            // Optional: Notification zeigen
            this.showNotification('👋 Erfolgreich abgemeldet!', 'info');
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('registerUsername')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;
        
        // Validierung
        if (!username || !email || !password || !passwordConfirm) {
            this.showError('register', 'Bitte fülle alle Felder aus!');
            return;
        }
        
        if (password !== passwordConfirm) {
            this.showError('register', 'Passwörter stimmen nicht überein!');
            return;
        }
        
        if (password.length < 8) {
            this.showError('register', 'Passwort muss mindestens 8 Zeichen lang sein!');
            return;
        }
        
        if (username.length < 3) {
            this.showError('register', 'Benutzername muss mindestens 3 Zeichen lang sein!');
            return;
        }
        
        // E-Mail-Validierung
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('register', 'Bitte gib eine gültige E-Mail-Adresse ein!');
            return;
        }
        
        const submitBtn = document.getElementById('submitRegisterBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Registrierung läuft...';
        }
        
        try {
            const result = await window.authManager.register(username, email, password, passwordConfirm);
            
            if (result.success) {
                // ✅ NEU: Zeige E-Mail Verification Hinweis
                if (result.requiresVerification) {
                    this.showVerificationSuccess('register', result.message || 
                        `📧 Registrierung wird geprüft!\n\nDu erhältst in den nächsten Minuten eine E-Mail mit einem Verifizierungscode an:\n${email}\n\nBitte überprüfe auch deinen SPAM-Ordner.`
                    );
                    
                    // Formular leeren
                    this.clearForms();
                    
                    // Nach 5 Sekunden zum Login-Tab wechseln
                    setTimeout(() => {
                        this.switchTab('login');
                        this.showInfo('login', '📬 Bitte überprüfe deine E-Mails und klicke auf den Verifizierungslink.');
                    }, 5000);
                } else {
                    // Fallback für alte Registrierung ohne Verification
                    this.showSuccess('register', result.message);
                    this.clearForms();
                    
                    setTimeout(() => {
                        this.switchTab('login');
                        const loginUsernameInput = document.getElementById('loginUsername');
                        if (loginUsernameInput) {
                            loginUsernameInput.value = username;
                        }
                    }, 2000);
                }
            } else {
                this.showError('register', result.error);
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError('register', 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '📝 Registrieren';
            }
        }
    }
    
    // =========================================================================
    // UI HELPERS
    // =========================================================================
    
    showError(form, message) {
        const errorEl = document.getElementById(`${form}Error`);
        const successEl = document.getElementById(`${form}Success`);
        
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        
        if (successEl) {
            successEl.style.display = 'none';
        }
        
        setTimeout(() => {
            if (errorEl) errorEl.style.display = 'none';
        }, 5000);
    }
    
    showSuccess(form, message) {
        const successEl = document.getElementById(`${form}Success`);
        const errorEl = document.getElementById(`${form}Error`);
        
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
        
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
    
    /**
     * ✅ NEU: Zeige Verification Success Message (mit Icon und besserem Styling)
     */
    showVerificationSuccess(form, message) {
        const successEl = document.getElementById(`${form}Success`);
        const errorEl = document.getElementById(`${form}Error`);
        
        if (successEl) {
            successEl.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📧</div>
                    <div style="white-space: pre-line; line-height: 1.8;">${message}</div>
                </div>
            `;
            successEl.style.display = 'block';
            successEl.style.padding = '24px';
            successEl.style.borderRadius = '12px';
        }
        
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
    
    /**
     * ✅ NEU: Zeige Info-Nachricht (blau)
     */
    showInfo(form, message) {
        const successEl = document.getElementById(`${form}Success`);
        const errorEl = document.getElementById(`${form}Error`);
        
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            successEl.style.background = 'rgba(33, 150, 243, 0.2)';
            successEl.style.borderColor = 'rgba(33, 150, 243, 0.5)';
            successEl.style.color = '#64b5f6';
        }
        
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        
        // Auto-Hide nach 10 Sekunden
        setTimeout(() => {
            if (successEl) {
                successEl.style.display = 'none';
                // Reset Styles
                successEl.style.background = '';
                successEl.style.borderColor = '';
                successEl.style.color = '';
            }
        }, 10000);
    }
    
    clearMessages() {
        ['login', 'register'].forEach(form => {
            const errorEl = document.getElementById(`${form}Error`);
            const successEl = document.getElementById(`${form}Success`);
            if (errorEl) errorEl.style.display = 'none';
            if (successEl) {
                successEl.style.display = 'none';
                // Reset Styles
                successEl.style.background = '';
                successEl.style.borderColor = '';
                successEl.style.color = '';
                successEl.innerHTML = '';
            }
        });
    }
    
    clearForms() {
        const inputs = [
            'loginUsername', 'loginPassword',
            'registerUsername', 'registerEmail',
            'registerPassword', 'registerPasswordConfirm'
        ];
        
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'info' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showConfetti() {
        // Konfetti-Animation bei erfolgreichem Login
        const colors = ['#9d4edd', '#c77dff', '#e0aaff', '#ffc8dd', '#a2d2ff'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    border-radius: 50%;
                    z-index: 10000;
                    animation: confettiFall ${2 + Math.random() * 2}s linear;
                    pointer-events: none;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }
}

// CSS für Animationen (falls noch nicht vorhanden)
if (!document.getElementById('authUIStyles')) {
    const style = document.createElement('style');
    style.id = 'authUIStyles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize
let authUI;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authUI = new AuthUI();
        window.authUI = authUI;
    });
} else {
    authUI = new AuthUI();
    window.authUI = authUI;
}