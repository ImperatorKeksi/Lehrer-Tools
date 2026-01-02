/*
    ═══════════════════════════════════════════════════════════
    🔐 PASSWORD RESET UI
    ═══════════════════════════════════════════════════════════
*/

class PasswordResetUI {
    constructor() {
        this.currentStep = 1; // 1=Email, 2=Code, 3=NewPassword
        this.email = '';
        this.code = '';
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
        this.bindEvents();
        console.log('🔐 Password Reset UI initialized');
    }
    
    bindEvents() {
        // "Passwort vergessen?" Link im Login-Modal
        const forgotLinks = document.querySelectorAll('[data-action="forgot-password"]');
        forgotLinks.forEach(link => {
            if (link._forgotBound) return;
            link._forgotBound = true;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showResetModal();
            });
        });
    }
    
    // =========================================================================
    // MODAL ERSTELLEN & ANZEIGEN
    // =========================================================================
    
    showResetModal() {
        // Erstelle Modal falls nicht vorhanden
        let modal = document.getElementById('passwordResetModal');
        if (!modal) {
            modal = this.createResetModal();
            document.body.appendChild(modal);
        }
        
        // Reset auf Step 1
        this.currentStep = 1;
        this.email = '';
        this.code = '';
        this.updateModalContent();
        
        // Modal anzeigen
        modal.classList.remove('hidden');
    }
    
    createResetModal() {
        const modal = document.createElement('div');
        modal.id = 'passwordResetModal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="login-animation-container">
                        <img src="../icons/logo-simple.svg" alt="Logo" style="width:48px;height:48px;filter:drop-shadow(0 0 12px #9d4edd);">
                    </div>
                    <h3 class="epic-login-title">Passwort zurücksetzen</h3>
                    <button class="modal-close-btn" id="closeResetBtn" aria-label="Schließen">✖</button>
                </div>
                <div class="modal-body" id="resetModalBody">
                    <!-- Content wird dynamisch eingefügt -->
                </div>
            </div>
        `;
        
        // Event Listeners
        modal.querySelector('#closeResetBtn').addEventListener('click', () => this.closeResetModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeResetModal();
        });
        
        return modal;
    }
    
    updateModalContent() {
        const body = document.getElementById('resetModalBody');
        if (!body) return;
        
        if (this.currentStep === 1) {
            body.innerHTML = `
                <div class="auth-info">
                    <p>📧 Gib deine E-Mail-Adresse ein. Du erhältst einen 6-stelligen Code.</p>
                </div>
                <form id="resetRequestForm">
                    <div class="form-group">
                        <label for="resetEmail">E-Mail-Adresse:</label>
                        <input type="email" id="resetEmail" class="epic-input" 
                               placeholder="deine@email.de" required autocomplete="email">
                    </div>
                    <div id="resetError" class="auth-error" style="display: none;"></div>
                    <div id="resetSuccess" class="auth-success" style="display: none;"></div>
                </form>
                <div class="modal-footer">
                    <button type="button" id="sendResetCodeBtn" class="modal-btn btn-primary">
                        Code anfordern
                    </button>
                    <button type="button" id="cancelResetBtn" class="modal-btn-secondary">
                        Abbrechen
                    </button>
                </div>
            `;
            
            document.getElementById('sendResetCodeBtn').addEventListener('click', () => this.requestResetCode());
            document.getElementById('cancelResetBtn').addEventListener('click', () => this.closeResetModal());
            document.getElementById('resetRequestForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.requestResetCode();
            });
            
        } else if (this.currentStep === 2) {
            body.innerHTML = `
                <div class="auth-info">
                    <p>🔑 Gib den 6-stelligen Code ein, den wir an <strong>${this.email}</strong> gesendet haben.</p>
                </div>
                <form id="resetVerifyForm">
                    <div class="form-group">
                        <label for="resetCode">Reset-Code:</label>
                        <input type="text" id="resetCode" class="epic-input" 
                               placeholder="123456" required maxlength="6" 
                               pattern="[0-9]{6}" autocomplete="off"
                               style="text-align:center;font-size:24px;letter-spacing:5px;font-family:monospace;">
                    </div>
                    <div id="resetError" class="auth-error" style="display: none;"></div>
                    <div id="resetSuccess" class="auth-success" style="display: none;"></div>
                </form>
                <div class="modal-footer">
                    <button type="button" id="verifyCodeBtn" class="modal-btn btn-primary">
                        Code überprüfen
                    </button>
                    <button type="button" id="backToEmailBtn" class="modal-btn-secondary">
                        Zurück
                    </button>
                </div>
            `;
            
            document.getElementById('verifyCodeBtn').addEventListener('click', () => this.verifyResetCode());
            document.getElementById('backToEmailBtn').addEventListener('click', () => {
                this.currentStep = 1;
                this.updateModalContent();
            });
            document.getElementById('resetVerifyForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.verifyResetCode();
            });
            
            // Auto-focus auf Code-Input
            setTimeout(() => document.getElementById('resetCode').focus(), 100);
            
        } else if (this.currentStep === 3) {
            body.innerHTML = `
                <div class="auth-info">
                    <p>✅ Code bestätigt! Wähle jetzt ein neues Passwort.</p>
                </div>
                <form id="resetPasswordForm">
                    <div class="form-group">
                        <label for="newPassword">Neues Passwort:</label>
                        <div class="epic-password-wrapper">
                            <input type="password" id="newPassword" class="epic-input" 
                                   placeholder="Min. 8 Zeichen" required autocomplete="new-password">
                            <span class="toggle-password" id="toggleNewPassword" title="Passwort anzeigen">👁️</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Passwort bestätigen:</label>
                        <div class="epic-password-wrapper">
                            <input type="password" id="confirmPassword" class="epic-input" 
                                   placeholder="Wiederholen" required autocomplete="new-password">
                            <span class="toggle-password" id="toggleConfirmPassword" title="Passwort anzeigen">👁️</span>
                        </div>
                    </div>
                    <div id="resetError" class="auth-error" style="display: none;"></div>
                    <div id="resetSuccess" class="auth-success" style="display: none;"></div>
                </form>
                <div class="modal-footer">
                    <button type="button" id="setNewPasswordBtn" class="modal-btn btn-primary">
                        Passwort ändern
                    </button>
                    <button type="button" id="cancelNewPasswordBtn" class="modal-btn-secondary">
                        Abbrechen
                    </button>
                </div>
            `;
            
            document.getElementById('setNewPasswordBtn').addEventListener('click', () => this.setNewPassword());
            document.getElementById('cancelNewPasswordBtn').addEventListener('click', () => this.closeResetModal());
            document.getElementById('resetPasswordForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.setNewPassword();
            });
            
            // Password toggles
            this.setupPasswordToggle('toggleNewPassword', 'newPassword');
            this.setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');
        }
    }
    
    setupPasswordToggle(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        
        if (toggle && input) {
            toggle.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.textContent = '🙈';
                } else {
                    input.type = 'password';
                    toggle.textContent = '👁️';
                }
            });
        }
    }
    
    closeResetModal() {
        const modal = document.getElementById('passwordResetModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // =========================================================================
    // API CALLS
    // =========================================================================
    
    async requestResetCode() {
        const emailInput = document.getElementById('resetEmail');
        const email = emailInput?.value.trim();
        
        if (!email) {
            this.showError('Bitte gib deine E-Mail-Adresse ein!');
            return;
        }
        
        const btn = document.getElementById('sendResetCodeBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Wird gesendet...';
        }
        
        try {
            const formData = new FormData();
            formData.append('action', 'request');
            formData.append('email', email);
            
            const response = await fetch('../php/password_reset.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.email = email;
                this.showSuccess(data.message);
                
                setTimeout(() => {
                    this.currentStep = 2;
                    this.updateModalContent();
                }, 2000);
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('Reset request error:', error);
            this.showError('Verbindungsfehler. Bitte versuche es erneut.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Code anfordern';
            }
        }
    }
    
    async verifyResetCode() {
        const codeInput = document.getElementById('resetCode');
        const code = codeInput?.value.trim();
        
        if (!code || code.length !== 6) {
            this.showError('Bitte gib den 6-stelligen Code ein!');
            return;
        }
        
        const btn = document.getElementById('verifyCodeBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Überprüfe...';
        }
        
        try {
            const formData = new FormData();
            formData.append('action', 'verify');
            formData.append('email', this.email);
            formData.append('code', code);
            
            const response = await fetch('../php/password_reset.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.code = code;
                this.showSuccess('✅ Code bestätigt!');
                
                setTimeout(() => {
                    this.currentStep = 3;
                    this.updateModalContent();
                }, 1000);
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('Verify code error:', error);
            this.showError('Verbindungsfehler. Bitte versuche es erneut.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Code überprüfen';
            }
        }
    }
    
    async setNewPassword() {
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (!newPassword || !confirmPassword) {
            this.showError('Bitte fülle beide Passwort-Felder aus!');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('Passwörter stimmen nicht überein!');
            return;
        }
        
        if (newPassword.length < 8) {
            this.showError('Passwort muss mindestens 8 Zeichen lang sein!');
            return;
        }
        
        const btn = document.getElementById('setNewPasswordBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Wird gespeichert...';
        }
        
        try {
            const formData = new FormData();
            formData.append('action', 'reset');
            formData.append('email', this.email);
            formData.append('code', this.code);
            formData.append('new_password', newPassword);
            formData.append('confirm_password', confirmPassword);
            
            const response = await fetch('../php/password_reset.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess(data.message);
                
                setTimeout(() => {
                    this.closeResetModal();
                    // Login-Modal öffnen mit vorausgefülltem Username
                    if (window.authUI) {
                        window.authUI.openLoginModal();
                        setTimeout(() => {
                            const usernameInput = document.getElementById('loginUsername');
                            if (usernameInput && data.username) {
                                usernameInput.value = data.username;
                                document.getElementById('loginPassword')?.focus();
                            }
                        }, 100);
                    }
                }, 2000);
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('Set password error:', error);
            this.showError('Verbindungsfehler. Bitte versuche es erneut.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Passwort ändern';
            }
        }
    }
    
    // =========================================================================
    // UI HELPERS
    // =========================================================================
    
    showError(message) {
        const errorEl = document.getElementById('resetError');
        const successEl = document.getElementById('resetSuccess');
        
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
    
    showSuccess(message) {
        const successEl = document.getElementById('resetSuccess');
        const errorEl = document.getElementById('resetError');
        
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
}

// Initialize
let passwordResetUI;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        passwordResetUI = new PasswordResetUI();
        window.passwordResetUI = passwordResetUI;
    });
} else {
    passwordResetUI = new PasswordResetUI();
    window.passwordResetUI = passwordResetUI;
}