const CACHE = 'warriors-fc-v202604021700';
const ASSETS = [
  './mi_equipo_fc_final.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('firestore.googleapis.com')) return;
  if(e.request.url.includes('firebase.googleapis.com')) return;
  if(e.request.url.includes('identitytoolkit.googleapis.com')) return;
  if(e.request.url.includes('cloudinary.com')) return;

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
