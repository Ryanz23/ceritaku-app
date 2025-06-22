// Pastikan service worker sudah terdaftar
navigator.serviceWorker.ready.then(registration => {
  // Minta permission notifikasi
  return Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
      throw new Error('Permission not granted for Notification');
    }
    // Subscribe ke push service
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('<YOUR_PUBLIC_VAPID_KEY>')
    });
  });
}).then(subscription => {
  // Kirim subscription ke server untuk disimpan
  console.log('Push subscription:', JSON.stringify(subscription));
}).catch(err => {
  console.error('Push subscription error:', err);
});

// Fungsi helper untuk konversi key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
