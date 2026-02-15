// chat.js - Chat-App JavaScript (KORRIGIERT & OPTIMIERT)

// ============================================================================
// DOM-ELEMENTE
// ============================================================================

const elements = {
    userSearch: document.getElementById('userSearch'),
    userList: document.getElementById('userList'),
    newChatBtn: document.getElementById('newChatBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    chatUserImg: document.getElementById('chatUserImg'),
    chatUserName: document.getElementById('chatUserName'),
    chatUserStatus: document.getElementById('chatUserStatus'),
    chatHistory: document.getElementById('chatHistory'),
    deleteChatBtn: document.getElementById('deleteChatBtn'),
    chatForm: document.getElementById('chatForm'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    emojiPicker: document.getElementById('emojiPicker'),
    imageBtn: document.getElementById('imageBtn'),
    imageUpload: document.getElementById('imageUpload'),
    fileBtn: document.getElementById('fileBtn'),
    fileUpload: document.getElementById('fileUpload'),
    notification: document.getElementById('notification')
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function showNotification(message, duration = 3000) {
    elements.notification.textContent = message;
    elements.notification.classList.add('show');
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, duration);
}

function showLoading(show = true) {
    const loading = elements.userList.querySelector('.loading');
    if (loading) {
        loading.classList.toggle('active', show);
    }
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffMins < 1440) return `vor ${Math.floor(diffMins / 60)} Std`;
    
    return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatMessage(text) {
    // XSS-Schutz: HTML-Entities escapen
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };
    
    text = escapeHtml(text);
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

function createUserAvatar(username) {
    const firstLetter = encodeURIComponent(username.charAt(0).toUpperCase());
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%239d4edd' width='100' height='100' rx='50'/%3E%3Ctext x='50' y='50' font-size='45' text-anchor='middle' dy='.35em' fill='white' font-weight='bold'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
}

// KORRIGIERT: Pfad-Auflösung für Bilder
function resolveImagePath(fileUrl) {
    if (!fileUrl) return '';
    
    // Absolute URLs direkt verwenden
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        return fileUrl;
    }
    
    // Server-Root-Pfade direkt verwenden
    if (fileUrl.startsWith('/')) {
        return fileUrl;
    }
    
    // KORRIGIERT: chat.php liegt in /seiten/, Uploads in /assets/uploads/
    // fileUrl kommt als "assets/uploads/file_xxx.jpg"
    // Wir brauchen: "../assets/uploads/file_xxx.jpg"
    return '../' + fileUrl;
}

// ============================================================================
// HEARTBEAT FÜR ONLINE-STATUS
// ============================================================================

let heartbeatInterval = null;

function startHeartbeat() {
    // Aktivität alle 2 Minuten an Server senden
    heartbeatInterval = setInterval(async () => {
        try {
            await fetch(API_BASE + 'chat_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=heartbeat'
            });
        } catch (error) {
            console.error('Heartbeat Fehler:', error);
        }
    }, 120000); // 2 Minuten
    
    // Initiales Heartbeat
    fetch(API_BASE + 'chat_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=heartbeat'
    });
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// ============================================================================
// BENUTZERVERWALTUNG
// ============================================================================

async function loadUsers() {
    try {
        showLoading(true);
        
        console.log('🔄 Lade alle User...');
        
        // GEÄNDERT: Lädt ALLE verfügbaren User (nicht nur Chat-Partner)
        const response = await fetch(API_BASE + 'chat_api.php?action=all_users');
        const data = await response.json();
        
        console.log('📥 API Response:', data);
        
        if (data.success) {
            allUsers = data.data;
            
            console.log('👥 Gefundene User:', allUsers.length);
            
            if (allUsers.length === 0) {
                elements.userList.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #c77dff;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                        <div style="font-size: 1.1rem;">Keine anderen Benutzer in der Datenbank</div>
                        <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">Du bist der einzige User</div>
                    </div>
                `;
            } else {
                renderUserList(allUsers);
            }
        } else {
            console.error('❌ API Fehler:', data.msg);
            elements.userList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ff6b6b;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                    <div style="font-size: 1.1rem;">Fehler beim Laden</div>
                    <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">${data.msg || 'Unbekannter Fehler'}</div>
                </div>
            `;
            showNotification('⚠️ ' + (data.msg || 'Benutzer konnten nicht geladen werden'));
        }
        
        showLoading(false);
        
    } catch (error) {
        console.error('❌ Fehler beim Laden der Benutzer:', error);
        elements.userList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ff6b6b;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <div style="font-size: 1.1rem;">Verbindungsfehler</div>
                <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">${error.message}</div>
            </div>
        `;
        showNotification('❌ Verbindung zur Datenbank fehlgeschlagen');
        showLoading(false);
    }
}

function renderUserList(users) {
    elements.userList.innerHTML = '';
    
    if (users.length === 0) {
        elements.userList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #c77dff;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                <div style="font-size: 1.1rem;">Keine Benutzer gefunden</div>
            </div>
        `;
        return;
    }
    
    users.forEach(user => {
        const li = document.createElement('li');
        const avatarSrc = user.profile_img || createUserAvatar(user.username);
        
        li.innerHTML = `
            <img src="${avatarSrc}" alt="${user.username}">
            <span class="user-name">${user.username}</span>
            ${user.status === 'online' ? '<span class="user-status"></span>' : ''}
        `;
        
        li.addEventListener('click', () => openChatWithUser(user));
        
        if (currentChatUser && currentChatUser.id === user.id) {
            li.classList.add('active');
        }
        
        elements.userList.appendChild(li);
    });
}

// ============================================================================
// CHAT-VERWALTUNG
// ============================================================================

async function openChatWithUser(user) {
    try {
        currentChatUser = user;
        
        const avatarSrc = user.profile_img || createUserAvatar(user.username);
        elements.chatUserImg.src = avatarSrc;
        elements.chatUserName.textContent = user.username;
        elements.chatUserStatus.textContent = user.status === 'online' ? 'Online' : 'Offline';
        
        document.querySelectorAll('.user-list li').forEach(li => li.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        currentChatId = await getOrCreateChat(currentUserId, user.id);
        
        if (!currentChatId) {
            throw new Error('Chat konnte nicht erstellt werden');
        }
        
        await loadMessages();
        startMessagePolling();
        
    } catch (error) {
        console.error('Fehler beim Öffnen des Chats:', error);
        showNotification('❌ Chat konnte nicht geöffnet werden');
    }
}

async function getOrCreateChat(userId1, userId2) {
    try {
        const response = await fetch(API_BASE + 'chat_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=get_or_create_chat&other_user_id=${userId2}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.data.chat_id;
        } else {
            throw new Error(data.msg || 'Chat konnte nicht erstellt werden');
        }
    } catch (error) {
        console.error('Fehler bei Chat-Erstellung:', error);
        showNotification('❌ Chat konnte nicht geöffnet werden');
        return null;
    }
}

async function loadMessages() {
    try {
        if (!currentChatId) return;
        
        const response = await fetch(API_BASE + `chat_api.php?action=messages&chat_id=${currentChatId}`);
        const data = await response.json();
        
        if (data.success) {
            renderMessages(data.data);
        } else {
            console.error('Fehler:', data.msg);
            elements.chatHistory.innerHTML = `
                <div class="chat-empty">
                    <div class="chat-empty-icon">💬</div>
                    <div>Noch keine Nachrichten. Schreibe die erste!</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error);
        showNotification('❌ Nachrichten konnten nicht geladen werden');
    }
}

function renderMessages(messages) {
    elements.chatHistory.innerHTML = '';
    
    if (messages.length === 0) {
        elements.chatHistory.innerHTML = `
            <div class="chat-empty">
                <div class="chat-empty-icon">💬</div>
                <div>Noch keine Nachrichten. Schreibe die erste!</div>
            </div>
        `;
        return;
    }
    
    messages.forEach(msg => {
        addMessageToUI(msg);
    });
    
    scrollToBottom();
}

function addMessageToUI(msg) {
    const messageDiv = document.createElement('div');
    const isSent = msg.sender_id == currentUserId;
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    let content = '';
    
    if (msg.message_type === 'image' && msg.file_url) {
        // KORRIGIERT: Pfad korrekt auflösen
        const imageUrl = resolveImagePath(msg.file_url);
        
        content = `
            <div class="image-container">
                <img src="${imageUrl}" alt="Bild" onclick="openImageFullscreen('${imageUrl}')" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect fill=\\'%23333\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext x=\\'100\\' y=\\'100\\' font-size=\\'16\\' text-anchor=\\'middle\\' fill=\\'white\\'%3EBild nicht gefunden%3C/text%3E%3C/svg%3E'">
                <a href="${imageUrl}" download class="download-btn" title="Bild herunterladen">
                    <span>⬇️</span>
                </a>
            </div>
        `;
    } else if (msg.message_type === 'file' && msg.file_url) {
        const fileUrl = resolveImagePath(msg.file_url);
        const fileName = msg.message_text.replace('📎 ', '') || 'Datei';
        
        content = `
            <div class="file-container">
                <div class="message-content">
                    📎 ${fileName}
                </div>
                <a href="${fileUrl}" download class="file-download-btn">
                    Herunterladen ⬇️
                </a>
            </div>
        `;
    } else {
        content = `<div class="message-content">${formatMessage(msg.message_text)}</div>`;
    }
    
    messageDiv.innerHTML = `
        ${content}
        <div class="message-meta">${formatTime(msg.created_at)}</div>
    `;
    
    elements.chatHistory.appendChild(messageDiv);
}

function scrollToBottom() {
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
}

function startMessagePolling() {
    stopMessagePolling();
    messagePollingInterval = setInterval(async () => {
        if (currentChatId) {
            await loadMessages();
        }
    }, 5000);
}

function stopMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
}

// Bild im Vollbildmodus anzeigen
function openImageFullscreen(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="this.parentElement.remove()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <img src="${imageUrl}" alt="Bild">
                <div class="modal-controls">
                    <a href="${imageUrl}" download class="modal-btn">⬇️ Herunterladen</a>
                    <button class="modal-btn" onclick="this.closest('.image-modal').remove()">✖️ Schließen</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ============================================================================
// NACHRICHTEN SENDEN
// ============================================================================

async function sendMessage(text, type = 'text', fileUrl = null) {
    try {
        if (!currentChatId) {
            showNotification('⚠️ Bitte wähle zuerst einen Chat aus');
            return;
        }
        
        const response = await fetch(API_BASE + 'chat_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=send&chat_id=${currentChatId}&message_text=${encodeURIComponent(text)}&message_type=${type}&file_url=${encodeURIComponent(fileUrl || '')}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadMessages();
            showNotification('✅ Nachricht gesendet');
        } else {
            throw new Error(data.msg || 'Fehler beim Senden');
        }
        
    } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        showNotification('❌ Nachricht konnte nicht gesendet werden');
    }
}

// ============================================================================
// EVENT-HANDLER
// ============================================================================

elements.chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = elements.chatInput.value.trim();
    if (!text) return;
    
    await sendMessage(text);
    elements.chatInput.value = '';
    elements.chatInput.focus();
});

// EMOJI-PICKER
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '👍', '👎', '👏', '🙌', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'];

function initializeEmojiPicker() {
    elements.emojiPicker.innerHTML = '';
    emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.addEventListener('click', () => {
            elements.chatInput.value += emoji;
            elements.chatInput.focus();
            elements.emojiPicker.classList.remove('active');
        });
        elements.emojiPicker.appendChild(span);
    });
}

elements.emojiBtn.addEventListener('click', () => {
    elements.emojiPicker.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!elements.emojiBtn.contains(e.target) && !elements.emojiPicker.contains(e.target)) {
        elements.emojiPicker.classList.remove('active');
    }
});

// BILD-UPLOAD
elements.imageBtn.addEventListener('click', () => {
    elements.imageUpload.click();
});

elements.imageUpload.addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('⚠️ Bitte wähle eine Bilddatei aus');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('⚠️ Bild ist zu groß (max. 5MB)');
        return;
    }
    
    try {
        showNotification('⏳ Bild wird hochgeladen...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(API_BASE + 'upload.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Upload erfolgreich:', data);
            await sendMessage('[Bild]', 'image', data.file_url);
            showNotification('✅ Bild wurde gesendet');
        } else {
            throw new Error(data.msg || 'Upload fehlgeschlagen');
        }
        
    } catch (error) {
        console.error('Fehler beim Hochladen des Bildes:', error);
        showNotification('❌ Bild konnte nicht hochgeladen werden');
    }
    
    this.value = '';
});

// DATEI-UPLOAD
elements.fileBtn.addEventListener('click', () => {
    elements.fileUpload.click();
});

elements.fileUpload.addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.pptx', '.ppt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
        showNotification('⚠️ Dateityp nicht erlaubt');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('⚠️ Datei ist zu groß (max. 10MB)');
        return;
    }
    
    try {
        showNotification('⏳ Datei wird hochgeladen...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(API_BASE + 'upload.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            await sendMessage(`📎 ${file.name}`, 'file', data.file_url);
            showNotification('✅ Datei wurde gesendet');
        } else {
            throw new Error(data.msg || 'Upload fehlgeschlagen');
        }
        
    } catch (error) {
        console.error('Fehler beim Hochladen der Datei:', error);
        showNotification('❌ Datei konnte nicht hochgeladen werden');
    }
    
    this.value = '';
});

// BENUTZERSUCHE (einfacher lokaler Filter)
elements.userSearch.addEventListener('input', function() {
    const filter = this.value.toLowerCase().trim();
    
    if (filter === '') {
        // Alle User anzeigen
        renderUserList(allUsers);
    } else {
        // Lokaler Filter (kein API-Call)
        const filteredUsers = allUsers.filter(user => 
            user.username.toLowerCase().includes(filter) ||
            (user.email && user.email.toLowerCase().includes(filter))
        );
        renderUserList(filteredUsers);
    }
});

// SIDEBAR-BUTTONS
elements.newChatBtn.addEventListener('click', async () => {
    // Plus-Button lädt einfach die User-Liste neu
    await loadUsers();
    showNotification('💡 Wähle einen Benutzer aus der Liste');
    elements.userSearch.focus();
});

elements.settingsBtn.addEventListener('click', () => {
    showNotification('⚙️ Einstellungen werden bald verfügbar sein');
});

elements.logoutBtn.addEventListener('click', () => {
    if (confirm('Möchtest du dich wirklich abmelden?')) {
        showNotification('👋 Auf Wiedersehen!');
        stopHeartbeat();
        setTimeout(() => {
            window.location.href = '../php/logout.php';
        }, 1500);
    }
});

// CHAT LÖSCHEN
elements.deleteChatBtn.addEventListener('click', async () => {
    if (!currentChatId) {
        showNotification('⚠️ Kein Chat ausgewählt');
        return;
    }
    
    if (confirm(`Möchtest du den Chat mit ${currentChatUser?.username || 'diesem Benutzer'} wirklich löschen?`)) {
        try {
            const response = await fetch(API_BASE + 'chat_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=delete_chat&chat_id=${currentChatId}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                elements.chatHistory.innerHTML = `
                    <div class="chat-empty">
                        <div class="chat-empty-icon">💬</div>
                        <div>Wähle einen Chat aus der Liste</div>
                    </div>
                `;
                
                currentChatId = null;
                currentChatUser = null;
                elements.chatUserName.textContent = 'Wähle einen Chat';
                elements.chatUserStatus.textContent = '';
                
                stopMessagePolling();
                await loadUsers();
                
                showNotification('✅ Chat wurde gelöscht');
            } else {
                throw new Error(data.msg);
            }
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            showNotification('❌ Chat konnte nicht gelöscht werden');
        }
    }
});

// KEYBOARD-SHORTCUTS
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === elements.chatInput) {
        e.preventDefault();
        elements.chatForm.dispatchEvent(new Event('submit'));
    }
    
    if (e.key === 'Escape') {
        elements.emojiPicker.classList.remove('active');
        const modal = document.querySelector('.image-modal');
        if (modal) modal.remove();
    }
});

// ============================================================================
// INITIALISIERUNG
// ============================================================================

async function init() {
    console.log('🚀 Chat-App wird initialisiert...');
    console.log('👤 Eingeloggt als:', currentUsername, '(ID:', currentUserId, ')');
    console.log('🔗 API Base:', API_BASE);
    
    initializeEmojiPicker();
    
    // User laden
    console.log('📡 Starte User-Laden...');
    await loadUsers();
    
    elements.userSearch.focus();
    
    // Heartbeat starten für Online-Status
    startHeartbeat();
    
    console.log('✅ Chat-App bereit!');
    console.log('📊 Geladene User:', allUsers.length);
    showNotification(`👋 Willkommen ${currentUsername}!`);
}

init();

window.addEventListener('beforeunload', () => {
    stopMessagePolling();
    stopHeartbeat();
});