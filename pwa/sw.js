/* =========================================================== */
/* SERVICE WORKER - ERWEITERTE PWA FUNKTIONALITÄT             */
/* Offline-Support, Push-Notifications, Background Sync       */
/* =========================================================== */

const CACHE_NAME = 'lehrer-tools-v2.1.0';
const CACHE_STATIC = 'static-v2.1.0';
const CACHE_DYNAMIC = 'dynamic-v2.1.0';
const CACHE_IMAGES = 'images-v2.1.0';
const DEBUG_MODE = false;

// ========================================= 
// DATEIEN DIE GECACHT WERDEN SOLLEN       
// ========================================= 
const CACHE_FILES = [
  '../',
  '../START.html',
  '../seiten/index.html',
  '../seiten/game.html',
  '../seiten/dashboard.html',
  '../seiten/timer.html',
  '../seiten/stadt-land-fluss.html',
  '../seiten/zufallsgenerator.html',
  '../seiten/notenrechner.html',
  '../seiten/aufgabenroulette.html',
  '../stylesheets/styles.css',
  '../stylesheets/main.css',
  '../stylesheets/theme.css',
  '../stylesheets/animations.css',
  '../stylesheets/responsive.css',
  '../stylesheets/accessibility.css',
  '../stylesheets/pwa-styles.css',
  '../stylesheets/statistics.css',
  '../stylesheets/dashboard.css',
  '../stylesheets/export-share.css',
  '../stylesheets/pwa-styles.css',
  '../stylesheets/statistics.css',
  '../javascript/script.js',
  '../javascript/modules.js',
  '../javascript/sounds.js',
  '../javascript/auth.js',
  '../javascript/auth-ui.js',
  '../javascript/main.js',
  '../javascript/editor.js',
  '../javascript/stats.js',
  '../javascript/feedback.js',
  '../javascript/timer.js',
  '../javascript/stadt-land-fluss.js',
  '../javascript/zufallsgenerator.js',
  '../javascript/notenrechner.js',
  '../javascript/aufgabenroulette.js',
  '../javascript/dashboard.js',
  '../javascript/performance.js',
  '../javascript/statistics.js',
  '../javascript/export-share.js',
  '../javascript/haptic-feedback.js',
  '../javascript/animations.js',
  '../javascript/responsive.js',
  '../javascript/accessibility.js',
  '../javascript/pwa-controller.js',
  '../javascript/enhancements-loader.js',
  '../fragenkataloge/questions_it.js',
  '../fragenkataloge/questions_lagerlogistik.js',
  '../fragenkataloge/questions_standard.js',
  '../fragenkataloge/questions_kaufmaennisch.js',
  '../icons/logo.svg',
  '../icons/logo-simple.svg',
  '../pwa/manifest.json'
];

// =========================================
// SERVICE WORKER INSTALLATION             
// =========================================
self.addEventListener('install', event => {
  if (DEBUG_MODE) console.log('🔧 Service Worker wird installiert...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        if (DEBUG_MODE) console.log('📦 Dateien werden gecacht...');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        if (DEBUG_MODE) console.log('✅ Service Worker erfolgreich installiert!');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Fehler beim Installieren des Service Workers:', error);
      })
  );
});

// =========================================
// SERVICE WORKER AKTIVIERUNG              
// =========================================
self.addEventListener('activate', event => {
  if (DEBUG_MODE) console.log('🚀 Service Worker wird aktiviert...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Alte Caches löschen (außer aktuelle)
            const validCaches = [CACHE_NAME, CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES];
            if (!validCaches.includes(cacheName)) {
              if (DEBUG_MODE) console.log('🗑️ Alter Cache wird gelöscht:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        if (DEBUG_MODE) console.log('✅ Service Worker aktiviert!');
        return self.clients.claim();
      })
  );
});

// =========================================
// NETZWERK-ANFRAGEN ABFANGEN (Network First + Cache Fallback)
// =========================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API Requests: Network First
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Images: Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  // CSS/JS: Stale While Revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  // HTML: Network First
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: Cache First
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// ========================================
// CACHE STRATEGIES
// ========================================

// Cache First (with network fallback)
async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    if (DEBUG_MODE) console.log('📋 Cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    if (DEBUG_MODE) console.log('🌐 Network:', request.url);
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Fetch failed:', error);
    return new Response('Offline - Ressource nicht verfügbar', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First (with cache fallback)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }
    if (DEBUG_MODE) console.log('🌐 Network First:', request.url);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      if (DEBUG_MODE) console.log('📋 Cache Fallback:', request.url);
      return cachedResponse;
    }
    
    // Offline Page
    if (request.destination === 'document') {
      return caches.match('../START.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// =========================================
// BACKGROUND SYNC FÜR STATISTIKEN        
// =========================================
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-stats') {
    if (DEBUG_MODE) console.log('📊 Background Sync für Statistiken...');
    event.waitUntil(syncStatistics());
  }
});

// =========================================
// PUSH NOTIFICATIONS                      
// =========================================
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    if (DEBUG_MODE) console.log('📨 Push Notification erhalten:', data);
    
    const options = {
      body: data.body || 'Neue Herausforderung verfügbar!',
      icon: '../icons/logo-simple.svg',
      badge: '../icons/logo-simple.svg',
      vibrate: [200, 100, 200],
      data: data.url || '../',
      actions: [
        {
          action: 'open',
          title: 'Öffnen',
          icon: '../icons/logo-simple.svg'
        },
        {
          action: 'close', 
          title: 'Schließen'
        }
      ],
      tag: data.tag || 'general',
      requireInteraction: false,
      silent: false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Lehrer Tools', options)
    );
  }
});

// =========================================
// NOTIFICATION CLICK HANDLING             
// =========================================
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data || '../';
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          // Fokussiere bestehendes Fenster
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Öffne neues Fenster
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// =========================================
// MESSAGE HANDLING (für Timer Notifications)
// =========================================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TIMER_NOTIFICATION') {
    const { title, body } = event.data;
    
    self.registration.showNotification(title, {
      body: body,
      icon: '../icons/logo-simple.svg',
      badge: '../icons/logo-simple.svg',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'timer',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Öffnen' }
      ]
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// =========================================
// PERIODIC BACKGROUND SYNC (für Updates)
// =========================================
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  // Prüfe auf Updates
  try {
    const response = await fetch('../pwa/version.json');
    if (response.ok) {
      const versionData = await response.json();
      // Benachrichtige über Updates
      if (DEBUG_MODE) console.log('🔄 Content Sync:', versionData);
    }
  } catch (error) {
    if (DEBUG_MODE) console.log('⚠️ Sync failed:', error);
  }
}

// =========================================
// HILFSFUNKTIONEN                         
// =========================================
async function syncStatistics() {
  try {
    // Statistiken aus localStorage holen und ggf. an Server senden
    // Hier könnte eine API-Verbindung für Online-Statistiken implementiert werden
    if (DEBUG_MODE) console.log('📈 Statistiken synchronisiert');
  } catch (error) {
    console.error('❌ Fehler beim Synchronisieren der Statistiken:', error);
  }
}