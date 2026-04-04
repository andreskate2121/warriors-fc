const CACHE = 'warriors-fc-v202604040002';
const ASSETS = [
  './mi_equipo_fc_final.html',
  './manifest.json'
];

// ── INSTALL ───────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

// ── ACTIVATE ──────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('firestore.googleapis.com')) return;
  if(e.request.url.includes('firebase.googleapis.com')) return;
  if(e.request.url.includes('identitytoolkit.googleapis.com')) return;
  if(e.request.url.includes('cloudinary.com')) return;
  if(e.request.url.includes('ntfy.sh')) return;

  e.respondWith(
    fetch(e.request).then(response => {
      if(response && response.status === 200){
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────
self.addEventListener('push', e => {
  let data = { title: '⚽ Warriors FC', body: 'Nuevo mensaje en el chat' };
  try {
    if(e.data) data = e.data.json();
  } catch(err) {
    if(e.data) data.body = e.data.text();
  }
  e.waitUntil(
    self.registration.showNotification(data.title || '⚽ Warriors FC', {
      body: data.body || 'Nuevo mensaje',
      icon: 'https://res.cloudinary.com/dwef0bowz/image/upload/w_192,h_192,c_fill/wsjs716llevmiqtdcrvb.jpg',
      badge: 'https://res.cloudinary.com/dwef0bowz/image/upload/w_72,h_72,c_fill/wsjs716llevmiqtdcrvb.jpg',
      tag: 'warriors-chat',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: './mi_equipo_fc_final.html' }
    })
  );
});

// ── CLICK EN NOTIFICACIÓN ─────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      const url = e.notification.data?.url || './mi_equipo_fc_final.html';
      for(const c of cls){
        if(c.url.includes('warriors-fc') && 'focus' in c) return c.focus();
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});
