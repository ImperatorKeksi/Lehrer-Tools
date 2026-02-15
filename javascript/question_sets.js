/*
╔══════════════════════════════════════════════════════════════════════════╗
║  📦 QUESTION SETS MANAGER - KOMPLETT MIT DEBUG                           ║
║  Wartet auf window.editor und bindet dann die Buttons                   ║
╚══════════════════════════════════════════════════════════════════════════╝
*/

class QuestionSetsManager {
    constructor() {
        this.apiUrl = '../php/question_sets_api.php';
        this.currentSets = { my: [], public: [] };
        this.eventsBound = false;
        this.currentSharingSetId = null;
        console.log('🔧 QuestionSetsManager Constructor aufgerufen');
        this.init();
    }

    init() {
        console.log('📦 QuestionSetsManager initialisiert');
        this.bindModalEvents();
        this.waitForEditor();
        this.checkURLParams();
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const loadSetId = urlParams.get('load_set');
        if (loadSetId) {
            console.log('🔗 URL-Parameter load_set gefunden:', loadSetId);

            // Erst Infos zum Set abrufen für den Bestätigungsdialog
            this.fetchSetInfoAndConfirm(parseInt(loadSetId));
        }
    }

    async fetchSetInfoAndConfirm(setId) {
        try {
            const response = await fetch(`${this.apiUrl}?action=load_set&set_id=${setId}`, { credentials: 'include' });
            const data = await response.json();

            if (data.success && data.set) {
                // Der vom Nutzer gewünschte Bestätigungsdialog
                if (confirm(`Möchten Sie den Katalog "${data.set.set_name}" wirklich in Ihr Spiel implizieren?`)) {
                    this.loadSet(setId, true); // true = autoStart
                }
            } else {
                console.error('Fehler beim Abrufen der Set-Infos:', data.message);
            }
        } catch (error) {
            console.error('Fetch Set Info Error:', error);
        }
    }

    // ========================================================================
    // WARTE AUF WINDOW.EDITOR - KOMPLETT NEU MIT DEBUG
    // ========================================================================

    waitForEditor() {
        console.log('⏳ QuestionSetsManager wartet auf window.editor...');

        // 1. Prüfe ob Editor bereits existiert
        if (window.editor) {
            console.log('✅ window.editor bereits vorhanden!');
            this.setupEditorIntegration();
            return;
        }

        // 2. Lausche auf editorReady Event
        window.addEventListener('editorReady', (event) => {
            console.log('✅ editorReady Event empfangen!', event.detail);
            this.setupEditorIntegration();
        }, { once: true });

        // 3. Fallback: Polling alle 100ms
        let attempts = 0;
        const maxAttempts = 100; // 10 Sekunden

        const checkInterval = setInterval(() => {
            attempts++;

            if (window.editor) {
                console.log(`✅ window.editor gefunden nach ${attempts} Versuchen!`);
                clearInterval(checkInterval);
                this.setupEditorIntegration();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ window.editor nicht gefunden nach 10 Sekunden!');
                console.error('Verfügbare window-Objekte:', Object.keys(window).filter(k => k.includes('editor')));
            } else if (attempts % 10 === 0) {
                console.log(`⏳ Warte auf window.editor... (${attempts}/${maxAttempts})`);
            }
        }, 100);
    }

    setupEditorIntegration() {
        console.log('🔗 Richte Editor-Integration ein...');

        // Observer für Editor-Öffnung
        const observer = new MutationObserver(() => {
            const editorScreen = document.getElementById('editorScreen');
            if (editorScreen && !editorScreen.classList.contains('hidden')) {
                console.log('✅ Editor wurde geöffnet, binde Button-Events...');
                this.bindEditorButtons();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Fallback: Sofort binden falls Editor bereits offen ist
        setTimeout(() => {
            const editorScreen = document.getElementById('editorScreen');
            if (editorScreen && !editorScreen.classList.contains('hidden')) {
                console.log('✅ Editor bereits offen, binde Buttons sofort');
                this.bindEditorButtons();
            }
        }, 100);

        // Zusätzlicher Fallback
        const checkInterval = setInterval(() => {
            const editorScreen = document.getElementById('editorScreen');
            if (editorScreen && !editorScreen.classList.contains('hidden')) {
                this.bindEditorButtons();
                clearInterval(checkInterval);
            }
        }, 500);

        setTimeout(() => clearInterval(checkInterval), 30000);
    }

    // ========================================================================
    // FRAGEN VOM EDITOR HOLEN
    // ========================================================================

    getQuestionsFromEditor() {
        console.log('📋 Hole Fragen vom Editor...');

        if (!window.editor) {
            console.error('❌ window.editor nicht verfügbar!');
            return null;
        }

        if (!window.editor.categories || window.editor.categories.length === 0) {
            console.warn('⚠️ Keine Kategorien im Editor');
            return null;
        }

        const questionsData = {
            categories: window.editor.categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                questions: cat.questions.map(q => ({
                    id: q.id,
                    question: q.question,
                    answer: q.answer,
                    points: typeof q.points === 'number' ? q.points : 100
                }))
            }))
        };

        console.log('✅ Fragen konvertiert:', questionsData.categories.length, 'Kategorien');
        return questionsData;
    }

    // ========================================================================
    // BUTTON EVENTS
    // ========================================================================

    bindEditorButtons() {
        if (this.eventsBound) {
            console.log('⚠️ Events bereits gebunden, überspringe...');
            return;
        }

        console.log('🔗 Binde Editor-Button-Events...');

        const saveBtn = document.getElementById('saveQuestionsToDBBtn');
        const loadBtn = document.getElementById('loadQuestionsFromDBBtn');

        if (saveBtn) {
            // Entferne alte Event-Listener
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

            newSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('💾 Save Button geklickt!');
                this.openSaveSetModal();
            });
            console.log('💾 Save Button gebunden ✅');
        } else {
            console.error('❌ saveQuestionsToDBBtn nicht gefunden!');
        }

        if (loadBtn) {
            // Entferne alte Event-Listener
            const newLoadBtn = loadBtn.cloneNode(true);
            loadBtn.parentNode.replaceChild(newLoadBtn, loadBtn);

            newLoadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📂 Load Button geklickt!');
                this.openLoadSetsModal();
            });
            console.log('📂 Load Button gebunden ✅');
        } else {
            console.error('❌ loadQuestionsFromDBBtn nicht gefunden!');
        }

        this.eventsBound = true;
        console.log('✅ Alle Editor-Buttons erfolgreich gebunden!');
    }

    bindModalEvents() {
        console.log('🔗 Binde Modal-Events...');

        document.getElementById('closeSaveSetBtn')?.addEventListener('click', () => this.closeSaveSetModal());
        document.getElementById('cancelSaveSetBtn')?.addEventListener('click', () => this.closeSaveSetModal());
        document.getElementById('submitSaveSetBtn')?.addEventListener('click', () => this.saveCurrentSet());

        document.getElementById('setName')?.addEventListener('input', (e) => {
            document.getElementById('setNameCounter').textContent = `${e.target.value.length} / 100`;
        });

        document.getElementById('setDescription')?.addEventListener('input', (e) => {
            document.getElementById('setDescCounter').textContent = `${e.target.value.length} / 500`;
        });

        document.getElementById('closeLoadSetsBtn')?.addEventListener('click', () => this.closeLoadSetsModal());
        document.getElementById('closeLoadSetsBtn2')?.addEventListener('click', () => this.closeLoadSetsModal());
        document.getElementById('refreshSetsBtn')?.addEventListener('click', () => this.refreshSets());

        document.querySelectorAll('.sets-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('publicSetsSearch')?.addEventListener('input', (e) => {
            this.filterPublicSets(e.target.value);
        });

        document.getElementById('closeShareSetBtn')?.addEventListener('click', () => this.closeShareModal());
        document.getElementById('cancelShareSetBtn')?.addEventListener('click', () => this.closeShareModal());
        document.getElementById('userSharedSearch')?.addEventListener('input', (e) => {
            this.searchUsersForSharing(e.target.value);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSaveSetModal();
                this.closeLoadSetsModal();
                this.closeShareModal();
            }
        });

        console.log('✅ Modal-Events gebunden');
    }

    // ========================================================================
    // SAVE SET
    // ========================================================================

    async openSaveSetModal() {
        console.log('💾 openSaveSetModal aufgerufen');

        // WICHTIG: Prüfe Login-Status UND hole Session-Info
        if (!window.authManager?.isLoggedIn()) {
            this.showNotification('🔒 Bitte melde dich an', 'Du musst eingeloggt sein.', 'warning');
            return;
        }

        // Extra Session-Check via API
        try {
            const checkResponse = await fetch('../php/auth_check.php', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const checkData = await checkResponse.json();

            if (!checkData.logged_in) {
                this.showNotification('🔒 Session abgelaufen', 'Bitte melde dich erneut an.', 'warning');
                return;
            }

            console.log('✅ Session aktiv:', checkData.user);
        } catch (error) {
            console.error('❌ Session-Check Fehler:', error);
        }

        const role = window.authManager.getRole();
        if (!['lehrer', 'administrator'].includes(role)) {
            this.showNotification('🔒 Keine Berechtigung', 'Nur Lehrer können Sets speichern.', 'warning');
            return;
        }

        const questionsData = this.getQuestionsFromEditor();
        if (!questionsData) {
            this.showNotification('❌ Keine Fragen', 'Erstelle zuerst Fragen im Editor.', 'error');
            return;
        }

        const modal = document.getElementById('saveSetModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('setName')?.focus();

            // Felder zurücksetzen
            document.getElementById('setName').value = '';
            document.getElementById('setDescription').value = '';
            document.getElementById('setPublic').checked = false;
            document.getElementById('setNameCounter').textContent = '0 / 100';
            document.getElementById('setDescCounter').textContent = '0 / 500';

            this.hideMessage('saveSetError');
            this.hideMessage('saveSetSuccess');
        }
    }

    closeSaveSetModal() {
        document.getElementById('saveSetModal')?.classList.add('hidden');
    }

    async saveCurrentSet() {
        const setName = document.getElementById('setName')?.value.trim();
        const description = document.getElementById('setDescription')?.value.trim();
        const isPublic = document.getElementById('setPublic')?.checked;

        if (!setName || setName.length < 3) {
            this.showError('saveSetError', 'Name muss mindestens 3 Zeichen haben!');
            return;
        }

        const questionsData = this.getQuestionsFromEditor();
        if (!questionsData) {
            this.showError('saveSetError', 'Keine Fragen vorhanden!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('action', 'save_set');
            formData.append('set_name', setName);
            formData.append('description', description);
            formData.append('questions_data', JSON.stringify(questionsData));
            formData.append('is_public', isPublic ? '1' : '0');

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('saveSetSuccess', data.message);
                this.showNotification('✅ Gespeichert!', `Set "${setName}" gespeichert.`, 'success');
                setTimeout(() => this.closeSaveSetModal(), 1500);
            } else {
                this.showError('saveSetError', data.message || 'Fehler beim Speichern');
            }
        } catch (error) {
            console.error('❌ Save Error:', error);
            this.showError('saveSetError', 'Netzwerkfehler: ' + error.message);
        }
    }

    // ========================================================================
    // LOAD SETS
    // ========================================================================

    async openLoadSetsModal() {
        if (!window.authManager?.isLoggedIn()) {
            this.showNotification('🔒 Bitte melde dich an', 'Du musst eingeloggt sein.', 'warning');
            return;
        }

        document.getElementById('loadSetsModal')?.classList.remove('hidden');
        await this.loadMySets();
        await this.loadSharedSets(); // NEU
        await this.loadPublicSets();
        await this.loadStats();
    }

    closeLoadSetsModal() {
        document.getElementById('loadSetsModal')?.classList.add('hidden');
    }

    async loadMySets() {
        const container = document.getElementById('mySetsContainer');
        if (!container) return;

        container.innerHTML = '<div class="sets-loading"><p>⏳ Lade Sets...</p></div>';

        try {
            const response = await fetch(`${this.apiUrl}?action=list_my_sets`, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.currentSets.my = data.sets;
                this.renderMySets(data.sets);
            }
        } catch (error) {
            console.error('Load Error:', error);
            container.innerHTML = '<div class="sets-empty"><p>❌ Fehler</p></div>';
        }
    }

    async loadPublicSets() {
        const container = document.getElementById('publicSetsContainer');
        if (!container) return;

        container.innerHTML = '<div class="sets-loading"><p>⏳ Lade Sets...</p></div>';

        try {
            const response = await fetch(`${this.apiUrl}?action=list_public_sets`, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.currentSets.public = data.sets;
                this.renderPublicSets(data.sets);
            }
        } catch (error) {
            container.innerHTML = '<div class="sets-empty"><p>❌ Fehler</p></div>';
        }
    }

    async loadSharedSets() {
        const container = document.getElementById('sharedSetsContainer');
        if (!container) return;

        container.innerHTML = '<div class="sets-loading"><p>⏳ Lade geteilte Sets...</p></div>';

        try {
            const response = await fetch(`${this.apiUrl}?action=list_shared_with_me`, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.currentSets.shared = data.sets;
                this.renderSharedSets(data.sets);
                if (document.getElementById('sharedSetsBadge')) {
                    document.getElementById('sharedSetsBadge').textContent = data.sets.length;
                }
            }
        } catch (error) {
            console.error('Load Shared Error:', error);
            container.innerHTML = '<div class="sets-empty"><p>❌ Fehler</p></div>';
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiUrl}?action=get_stats`, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                document.getElementById('mySetsBadge').textContent = data.stats.total_sets;
                document.getElementById('totalPlaysBadge').textContent = data.stats.total_plays;
            }
        } catch (error) {
            console.error('Stats Error:', error);
        }
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    renderMySets(sets) {
        const container = document.getElementById('mySetsContainer');
        if (!container) return;

        if (sets.length === 0) {
            container.innerHTML = '<div class="sets-empty"><div class="sets-empty-icon">📂</div><p><strong>Noch keine Sets</strong></p></div>';
            return;
        }

        container.innerHTML = sets.map(set => `
            <div class="set-card">
                <div class="set-card-header">
                    <div>
                        <h4 class="set-card-title">${this.escapeHtml(set.set_name)}</h4>
                        <div class="set-card-author">${this.formatDate(set.created_at)}</div>
                    </div>
                    <div class="set-card-actions">
                        <button class="set-action-btn" title="Katalog laden" onclick="questionSetsManager.loadSet(${set.id})">📂</button>
                        <button class="set-action-btn" title="Katalog teilen" onclick="questionSetsManager.openShareModal(${set.id})">📤</button>
                        <button class="set-action-btn" title="Katalog löschen" onclick="questionSetsManager.deleteSet(${set.id}, '${this.escapeHtml(set.set_name)}')">🗑️</button>
                    </div>
                </div>
                ${set.description ? `<div class="set-card-description">${this.escapeHtml(set.description)}</div>` : ''}
                <div class="set-card-meta">
                    <span>👁️ ${set.play_count}</span>
                    <span>${set.is_public ? '🌐' : '🔒'}</span>
                </div>
            </div>
        `).join('');
    }

    renderPublicSets(sets) {
        const container = document.getElementById('publicSetsContainer');
        if (!container) return;

        if (sets.length === 0) {
            container.innerHTML = '<div class="sets-empty"><div class="sets-empty-icon">🌐</div><p><strong>Keine Sets</strong></p></div>';
            return;
        }

        container.innerHTML = sets.map(set => `
            <div class="set-card">
                <div class="set-card-header">
                    <div>
                        <h4 class="set-card-title">${this.escapeHtml(set.set_name)}</h4>
                        <div class="set-card-author">von ${this.escapeHtml(set.author)}</div>
                    </div>
                    <div class="set-card-actions">
                        <button class="set-action-btn" title="Katalog laden" onclick="questionSetsManager.loadSet(${set.id})">📂</button>
                        <button class="set-action-btn" title="Katalog teilen" onclick="questionSetsManager.openShareModal(${set.id})">📤</button>
                    </div>
                </div>
                ${set.description ? `<div class="set-card-description">${this.escapeHtml(set.description)}</div>` : ''}
                <div class="set-card-meta">
                    <span>👁️ ${set.play_count}</span>
                    <span>📅 ${this.formatDate(set.created_at)}</span>
                </div>
            </div>
        `).join('');
    }

    renderSharedSets(sets) {
        const container = document.getElementById('sharedSetsContainer');
        if (!container) return;

        if (sets.length === 0) {
            container.innerHTML = '<div class="sets-empty"><div class="sets-empty-icon">📤</div><p><strong>Noch keine geteilten Sets</strong></p></div>';
            return;
        }

        container.innerHTML = sets.map(set => `
            <div class="set-card">
                <div class="set-card-header">
                    <div>
                        <h4 class="set-card-title">${this.escapeHtml(set.set_name)}</h4>
                        <div class="set-card-author">Geteilt von: <strong>${this.escapeHtml(set.author)}</strong></div>
                    </div>
                    <div class="set-card-actions">
                        <button class="set-action-btn" title="Katalog laden" onclick="questionSetsManager.loadSet(${set.set_id})">📂</button>
                    </div>
                </div>
                ${set.description ? `<div class="set-card-description">${this.escapeHtml(set.description)}</div>` : ''}
                <div class="set-card-meta">
                    <span>📅 Empfangen am: ${this.formatDate(set.shared_at)}</span>
                </div>
            </div>
        `).join('');
    }

    async loadSet(setId, autoStart = false) {
        try {
            const response = await fetch(`${this.apiUrl}?action=load_set&set_id=${setId}`, { credentials: 'include' });
            const data = await response.json();

            if (data.success && window.editor) {
                window.editor.categories = data.set.questions_data.categories.map((cat, i) => ({
                    id: cat.id || `cat-${Date.now()}-${i}`,
                    name: cat.name,
                    questions: cat.questions.map((q, qi) => ({
                        id: q.id || `q-${Date.now()}-${i}-${qi}`,
                        question: q.question,
                        answer: q.answer
                    }))
                }));

                window.editor.currentCategoryId = null;
                window.editor.renderCategories();
                window.editor.showQuestionsPlaceholder();
                window.editor.saveToLocalStorage();
                window.jeopardyData = data.set.questions_data;

                this.closeLoadSetsModal();

                if (autoStart) {
                    this.showNotification('🚀 Katalog impliziert!', `Spiel wird gestartet...`, 'success');
                    setTimeout(() => {
                        if (window.game) {
                            window.game.startQuickGame();
                        }
                    }, 500);
                } else {
                    this.showNotification('✅ Geladen!', `Set "${data.set.set_name}" geladen.`, 'success');
                }
            }
        } catch (error) {
            console.error('Load Error:', error);
        }
    }

    async deleteSet(setId, setName) {
        if (!confirm(`Set "${setName}" löschen?`)) return;

        try {
            const formData = new FormData();
            formData.append('action', 'delete_set');
            formData.append('set_id', setId);

            const response = await fetch(this.apiUrl, { method: 'POST', body: formData, credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Gelöscht', data.message, 'success');
                await this.refreshSets();
            }
        } catch (error) {
            console.error('Delete Error:', error);
        }
    }

    // ========================================================================
    // SHARING LOGIC
    // ========================================================================

    openShareModal(setId) {
        console.log('📤 openShareModal für Set:', setId);
        const set = [...this.currentSets.my, ...this.currentSets.public].find(s => parseInt(s.id) === parseInt(setId));
        if (!set) {
            this.showNotification('❌ Fehler', 'Katalog nicht gefunden.', 'error');
            return;
        }

        this.currentSharingSetId = setId;
        const modal = document.getElementById('shareSetModal');
        if (modal) {
            modal.classList.remove('hidden');
            const nameDisplay = document.getElementById('shareSetNameDisplay');
            if (nameDisplay) nameDisplay.textContent = `Katalog: ${set.set_name}`;

            const searchInput = document.getElementById('userSharedSearch');
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }

            const resultsContainer = document.getElementById('userSearchResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = '<p class="stats-empty">Gib einen Namen ein, um nach Benutzern zu suchen.</p>';
            }
        } else {
            console.error('❌ shareSetModal nicht gefunden!');
        }
    }

    closeShareModal() {
        document.getElementById('shareSetModal')?.classList.add('hidden');
        this.currentSharingSetId = null;
    }

    async searchUsersForSharing(query) {
        const resultsContainer = document.getElementById('userSearchResults');
        if (!resultsContainer) return;

        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '<p class="stats-empty">Gib mindestens 2 Zeichen ein.</p>';
            return;
        }

        try {
            const response = await fetch(`../php/chat_api.php?action=search_users&query=${encodeURIComponent(query)}`, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                if (data.data.length === 0) {
                    resultsContainer.innerHTML = '<p class="stats-empty">Keine Benutzer gefunden.</p>';
                } else {
                    resultsContainer.innerHTML = data.data.map(user => `
                        <div class="user-search-item" style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(157, 78, 221, 0.1); border-radius:8px; cursor:pointer;" onclick="questionSetsManager.shareWithUser(${user.id}, '${this.escapeHtml(user.username)}')">
                            <img src="${user.profile_img || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%239d4edd\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50\' y=\'50\' font-size=\'40\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\'%3E👤%3C/text%3E%3C/svg%3E'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                            <div style="flex:1;">
                                <div style="font-weight:bold;">${this.escapeHtml(user.username)}</div>
                                <div style="font-size:0.8rem; opacity:0.7;">${user.status === 'online' ? '🟢 Online' : '⚪ Offline'}</div>
                            </div>
                            <button class="btn-primary" style="padding:4px 12px; font-size:0.9rem;">Teilen</button>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Search Error:', error);
            resultsContainer.innerHTML = '<p class="stats-empty">❌ Fehler bei der Suche.</p>';
        }
    }

    async shareWithUser(userId, username) {
        if (!this.currentSharingSetId) {
            console.error('❌ Keine currentSharingSetId vorhanden!');
            return;
        }

        const set = [...this.currentSets.my, ...this.currentSets.public].find(s => parseInt(s.id) === parseInt(this.currentSharingSetId));
        if (!set) {
            this.showNotification('❌ Fehler', 'Katalogdaten verloren gegangen.', 'error');
            return;
        }

        try {
            this.showNotification('⏳ Teilen...', `Sende Katalog an ${username}...`, 'info');

            // 1. Chat ID holen oder erstellen
            const chatResponse = await fetch(`../php/chat_api.php?action=get_or_create_chat&other_user_id=${userId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const chatData = await chatResponse.json();

            if (chatData.success) {
                const chatId = chatData.data.chat_id;

                // 2. Spezial-Nachricht senden
                const formData = new FormData();
                formData.append('action', 'send');
                formData.append('chat_id', chatId);
                formData.append('message_type', 'catalog');
                formData.append('message_text', JSON.stringify({
                    set_id: set.id,
                    set_name: set.set_name,
                    description: set.description || ''
                }));

                const shareResponse = await fetch(`../php/chat_api.php`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                const shareData = await shareResponse.json();

                if (shareData.success) {
                    this.showNotification('✅ Geteilt!', `Katalog wurde mit ${username} geteilt.`, 'success');
                    this.closeShareModal();
                } else {
                    this.showNotification('❌ Fehler', shareData.msg || 'Konnte nicht geteilt werden.', 'error');
                }
            } else {
                this.showNotification('❌ Fehler', 'Chat konnte nicht erstellt werden.', 'error');
            }
        } catch (error) {
            console.error('Share Error:', error);
            this.showNotification('❌ Fehler', 'Netzwerkfehler beim Teilen.', 'error');
        }
    }

    // ========================================================================
    // UTILITY
    // ========================================================================

    async refreshSets() {
        await this.loadMySets();
        await this.loadSharedSets();
        await this.loadPublicSets();
        await this.loadStats();
    }

    switchTab(tabName) {
        document.querySelectorAll('.sets-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.getElementById('mySetsTab')?.classList.toggle('active', tabName === 'my-sets');
        document.getElementById('publicSetsTab')?.classList.toggle('active', tabName === 'public-sets');
        document.getElementById('sharedSetsTab')?.classList.toggle('active', tabName === 'shared-sets');
    }

    filterPublicSets(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.currentSets.public.filter(set =>
            set.set_name.toLowerCase().includes(term) ||
            set.description?.toLowerCase().includes(term) ||
            set.author.toLowerCase().includes(term)
        );
        this.renderPublicSets(filtered);
    }

    showError(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }

    showSuccess(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }

    hideMessage(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    showNotification(title, message, type = 'info') {
        const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' };
        const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };

        const notification = document.createElement('div');
        notification.style.cssText = `position:fixed;top:100px;right:20px;background:${colors[type]};color:white;padding:1rem 1.5rem;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:10001;max-width:400px;cursor:pointer`;
        notification.innerHTML = `<div style="display:flex;gap:12px"><span style="font-size:24px">${icons[type]}</span><div><div style="font-weight:700">${title}</div><div style="font-size:0.9rem">${message}</div></div></div>`;
        notification.onclick = () => notification.remove();
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Heute';
        if (days === 1) return 'Gestern';
        if (days < 7) return `vor ${days} Tagen`;

        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}

// ============================================================================
// INITIALIZE - KOMPLETT NEU MIT DEBUG
// ============================================================================

let questionSetsManager;

function initQuestionSets() {
    console.log('🚀 initQuestionSets() aufgerufen');
    questionSetsManager = new QuestionSetsManager();
    window.questionSetsManager = questionSetsManager;
    console.log('✅ QuestionSetsManager erstellt und an window gebunden');
}

if (document.readyState === 'loading') {
    console.log('⏳ DOM lädt noch, warte auf DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initQuestionSets);
} else {
    console.log('✅ DOM bereits geladen, initialisiere sofort');
    initQuestionSets();
}