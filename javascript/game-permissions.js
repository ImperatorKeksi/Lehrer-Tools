/*
    ╔══════════════════════════════════════════════════╗
    ║  🔐 GAME PERMISSIONS - Rollenbasierte Features  ║
    ║  Integration für Jeopardy Quiz                  ║
    ║                                                  ║
    ╚══════════════════════════════════════════════════╝
*/

class GamePermissions {
    constructor() {
        this.authManager = null;
        this.checkInterval = null;
        this.init();
    }
    
    init() {
        // Warte auf AuthManager mit Retry-Logik
        this.waitForAuthManager();
    }
    
    waitForAuthManager() {
        if (window.authManager) {
            this.authManager = window.authManager;
            this.setupPermissions();
            console.log('✅ GamePermissions connected to AuthManager');
        } else {
            console.log('⏳ Waiting for AuthManager...');
            setTimeout(() => this.waitForAuthManager(), 100);
        }
    }
    
    setupPermissions() {
        console.log('🔐 Setting up game permissions...');
        
        // Initiale Update
        this.updateFeatureButtons();
        
        // Überwache Auth-Änderungen
        this.observeAuthChanges();
        
        // Bind Permission Checks
        this.bindPermissionChecks();
        
        // Periodische Prüfung (alle 2 Sekunden)
        this.checkInterval = setInterval(() => {
            this.updateFeatureButtons();
        }, 2000);
    }
    
    // =========================================================================
    // FEATURE BUTTON MANAGEMENT
    // =========================================================================
    
    updateFeatureButtons() {
        if (!this.authManager) return;
        
        const isLoggedIn = this.authManager.isLoggedIn();
        const role = isLoggedIn ? this.authManager.getRole() : 'schueler';
        
        // 1. EDITOR BUTTON - nur Lehrer/Admin
        this.updateEditorButton(role, isLoggedIn);
        
        // 2. STATS BUTTON - nur Admin
        this.updateStatsButton(role, isLoggedIn);
        
        // 3. FEEDBACK BUTTON - immer sichtbar
        this.updateFeedbackButton();
        
        // 4. ADMIN FEATURES
        this.updateAdminFeatures(role, isLoggedIn);
    }
    
    updateEditorButton(role, isLoggedIn) {
        const editorBtn = document.getElementById('openEditorBtn');
        
        if (!editorBtn) return;
        
        // Prüfe Berechtigung
        const canEdit = isLoggedIn && (role === 'lehrer' || role === 'administrator');
        
        if (canEdit) {
            editorBtn.style.display = 'inline-flex';
            editorBtn.disabled = false;
            editorBtn.classList.remove('disabled');
            editorBtn.title = '✏️ Fragen bearbeiten (Lehrer/Admin)';
            
            if (!editorBtn.dataset.permissionBound) {
                editorBtn.dataset.permissionBound = 'true';
                editorBtn.addEventListener('click', (e) => {
                    if (!this.checkEditorPermission()) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }, true);
            }
        } else {
            editorBtn.style.display = 'none';
            editorBtn.disabled = true;
            editorBtn.classList.add('disabled');
        }
    }
    
    updateStatsButton(role, isLoggedIn) {
        const statsBtn = document.getElementById('openStatsBtn');
        
        if (!statsBtn) return;
        
        // Stats nur für Admin
        const canViewStats = isLoggedIn && role === 'administrator';
        
        if (canViewStats) {
            statsBtn.style.display = 'inline-flex';
            statsBtn.disabled = false;
            statsBtn.title = '📊 Erweiterte Statistiken (Admin)';
        } else {
            statsBtn.style.display = 'none';
            statsBtn.disabled = true;
        }
    }
    
    updateFeedbackButton() {
        const feedbackBtn = document.getElementById('openFeedbackBtn');
        
        if (!feedbackBtn) return;
        
        // Feedback ist für ALLE verfügbar
        feedbackBtn.style.display = 'inline-flex';
        feedbackBtn.disabled = false;
        feedbackBtn.title = '💬 Feedback geben (für alle)';
    }
    
    updateAdminFeatures(role, isLoggedIn) {
        const isAdmin = isLoggedIn && role === 'administrator';
        
        // Admin-Badge im Header
        this.updateAdminBadge(isAdmin);
        
        // Weitere Admin-Features hier
    }
    
    updateAdminBadge(isAdmin) {
        const userDisplays = document.querySelectorAll('[id^="userDisplay"]');
        
        userDisplays.forEach(display => {
            if (isAdmin && display.textContent && !display.textContent.includes('👑')) {
                display.textContent = display.textContent.replace('👤', '👑');
                display.style.color = '#ffd700';
                display.style.fontWeight = 'bold';
                display.style.textShadow = '0 0 10px rgba(255,215,0,0.5)';
            }
        });
    }
    
    // =========================================================================
    // PERMISSION CHECKS
    // =========================================================================
    
    bindPermissionChecks() {
        console.log('🔗 Binding permission checks...');
        
        // Editor Button (zusätzlicher Schutz)
        const editorBtn = document.getElementById('openEditorBtn');
        if (editorBtn && !editorBtn.dataset.permissionBound) {
            editorBtn.dataset.permissionBound = 'true';
            editorBtn.addEventListener('click', (e) => {
                if (!this.checkEditorPermission()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
            }, true);
        }
        
        // Stats Button
        const statsBtn = document.getElementById('openStatsBtn');
        if (statsBtn && !statsBtn.dataset.permissionBound) {
            statsBtn.dataset.permissionBound = 'true';
            statsBtn.addEventListener('click', (e) => {
                if (!this.checkStatsPermission()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
            }, true);
        }
    }
    
    checkEditorPermission() {
        if (!this.authManager || !this.authManager.isLoggedIn()) {
            this.showPermissionError(
                'Editor',
                'Du musst angemeldet sein!\n\nBitte klicke auf "🔐 Anmelden" oben rechts.'
            );
            return false;
        }
        
        const role = this.authManager.getRole();
        const canEdit = (role === 'lehrer' || role === 'administrator');
        
        if (!canEdit) {
            this.showPermissionError(
                'Editor',
                `Keine Berechtigung!\n\nNur Lehrer und Administratoren können Fragen bearbeiten.\n\nDeine Rolle: ${this.getRoleLabel(role)}`
            );
            return false;
        }
        
        console.log('✅ Editor-Zugriff gewährt für:', this.authManager.currentUser.username);
        return true;
    }
    
    checkStatsPermission() {
        if (!this.authManager || !this.authManager.isLoggedIn()) {
            this.showPermissionError(
                'Statistiken',
                'Du musst angemeldet sein!'
            );
            return false;
        }
        
        const role = this.authManager.getRole();
        if (role !== 'administrator') {
            this.showPermissionError(
                'Statistiken',
                'Nur Administratoren können erweiterte Statistiken einsehen.'
            );
            return false;
        }
        
        return true;
    }
    
    // =========================================================================
    // USER FEEDBACK
    // =========================================================================
    
    showPermissionError(feature, message) {
        // Zeige eine freundliche Fehlermeldung
        const notification = this.createNotification(
            `🔒 Zugriff verweigert`,
            message,
            'warning'
        );
        
        document.body.appendChild(notification);
        
        // Auto-remove nach 5 Sekunden
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        console.warn(`🔒 Permission denied for ${feature}:`, message);
    }
    
    showPermissionSuccess(feature, message) {
        const notification = this.createNotification(
            `✅ ${feature}`,
            message,
            'success'
        );
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    createNotification(title, message, type = 'info') {
        const colors = {
            success: { bg: '#10b981', icon: '✅' },
            warning: { bg: '#f59e0b', icon: '⚠️' },
            error: { bg: '#ef4444', icon: '❌' },
            info: { bg: '#3b82f6', icon: 'ℹ️' }
        };
        
        const style = colors[type] || colors.info;
        
        const notification = document.createElement('div');
        notification.className = 'permission-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${style.bg};
            color: white;
            padding: 20px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            z-index: 10001;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            font-family: 'Segoe UI', system-ui, sans-serif;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <span style="font-size: 28px; flex-shrink: 0;">${style.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 700; margin-bottom: 6px; font-size: 16px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.5; white-space: pre-line;">${message}</div>
                </div>
            </div>
        `;
        
        // Click zum Schließen
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        return notification;
    }
    
    // =========================================================================
    // AUTH OBSERVER
    // =========================================================================
    
    observeAuthChanges() {
        if (!this.authManager) return;
        
        // Override updateUI method
        const originalUpdateUI = this.authManager.updateUI.bind(this.authManager);
        
        this.authManager.updateUI = () => {
            originalUpdateUI();
            this.updateFeatureButtons();
            console.log('🔄 Auth changed - permissions updated');
        };
        
        console.log('👁️ Auth observer activated');
    }
    
    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================
    
    getRoleInfo() {
        if (!this.authManager || !this.authManager.isLoggedIn()) {
            return {
                role: 'schueler',
                label: 'Gast',
                permissions: ['play', 'feedback']
            };
        }
        
        const role = this.authManager.getRole();
        return {
            role: role,
            label: this.getRoleLabel(role),
            permissions: this.getPermissions(role)
        };
    }
    
    getRoleLabel(role) {
        const labels = {
            schueler: 'Schüler/Gast',
            lehrer: 'Lehrer',
            administrator: 'Administrator'
        };
        return labels[role] || 'Unbekannt';
    }
    
    getPermissions(role) {
        const permissions = {
            schueler: ['play', 'feedback'],
            lehrer: ['play', 'feedback', 'editor'],
            administrator: ['play', 'feedback', 'editor', 'stats', 'user_management']
        };
        return permissions[role] || permissions.schueler;
    }
    
    hasPermission(permission) {
        const roleInfo = this.getRoleInfo();
        return roleInfo.permissions.includes(permission);
    }
    
    // Debugging
    logPermissions() {
        const info = this.getRoleInfo();
        console.log('╔═══════════════════════════════════╗');
        console.log('║   🔐 CURRENT PERMISSIONS          ║');
        console.log('╠═══════════════════════════════════╣');
        console.log('  Role:', info.label, `(${info.role})`);
        console.log('  Permissions:', info.permissions.join(', '));
        console.log('  ✏️  Can Edit:', this.hasPermission('editor'));
        console.log('  📊 Can View Stats:', this.hasPermission('stats'));
        console.log('  👥 Can Manage Users:', this.hasPermission('user_management'));
        console.log('╚═══════════════════════════════════╝');
    }
    
    // Cleanup
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// ============================================================================= 
// INITIALIZE PERMISSIONS                                                       
// ============================================================================= 

let gamePermissions;

function initGamePermissions() {
    gamePermissions = new GamePermissions();
    window.gamePermissions = gamePermissions;
    console.log('✅ GamePermissions initialized');
    
    // Debug-Befehle
    window.showPermissions = () => gamePermissions.logPermissions();
    window.checkEditor = () => gamePermissions.checkEditorPermission();
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamePermissions);
} else {
    initGamePermissions();
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (gamePermissions) {
        gamePermissions.destroy();
    }
});

// ============================================================================= 
// CSS ANIMATIONS                                                              
// ============================================================================= 

if (!document.getElementById('gamePermissionsStyles')) {
    const style = document.createElement('style');
    style.id = 'gamePermissionsStyles';
    style.textContent = `
        @keyframes slideIn {
            from { 
                transform: translateX(120%); 
                opacity: 0; 
            }
            to { 
                transform: translateX(0); 
                opacity: 1; 
            }
        }
        
        @keyframes slideOut {
            from { 
                transform: translateX(0); 
                opacity: 1; 
            }
            to { 
                transform: translateX(120%); 
                opacity: 0; 
            }
        }
        
        .permission-notification {
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .permission-notification:hover {
            transform: translateX(-5px) scale(1.02);
            box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        }
        
        .settings-action-btn.disabled,
        button.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}