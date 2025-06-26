const CACHE_NAME = 'ceritaku-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // tambahkan lainnya jika perlu
  '/assets/icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Install event');
  self.skipWaiting(); // langsung aktif
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  return self.clients.claim(); // ambil kendali halaman
});

// 💬 Menangani Push Event dari Dicoding
self.addEventListener('push', (event) => {
  console.log('📨 Push event diterima');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('❌ Error parsing push data:', e);
  }

  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.options?.body || 'Ada pembaruan di aplikasi CeritaKu.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/#/stories'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Menangani pesan dari client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'NEW_STORY_PUSH') {
    const { title, body, url } = event.data.data;

    const options = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url }
    };

    self.registration.showNotification(title, options);
  }
});

// 🚀 Klik notifikasi: buka aplikasi
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification diklik');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const focused = clientList.find(client => client.url.includes('/#/stories') && 'focus' in client);
      if (focused) return focused.focus();
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
  
});
