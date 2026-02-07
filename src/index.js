// Entry point untuk SPA berbagi cerita
import './style.css';
import { initRouter } from './router.js';
import { offlineStoryPresenter } from './presenter/offlineStoryPresenter.js';

let deferredPrompt;
const installBtn = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
  installBtn.style.display = 'none';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
  initRouter();
  const mainElement = document.getElementById('main-content');

  const container = document.createElement('div');
  container.id = 'map';
  container.style.height = '400px';
  mainElement.appendChild(container);

  offlineStoryPresenter.init(mainElement);
  offlineStoryPresenter.displayOfflineStories();

  // Contoh: Simpan story baru lewat form (jika ada)
  const form = document.getElementById('story-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const storyData = {
        name: formData.get('name'),
        description: formData.get('description'),
        content: formData.get('content'),
        photoUrl: formData.get('photoUrl'),
      };
      try {
        await offlineStoryPresenter.saveUserStory(storyData);
        offlineStoryPresenter.displayOfflineStories();
        form.reset();
      } catch (err) {
        // Error sudah ditangani di presenter
      }
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
});
