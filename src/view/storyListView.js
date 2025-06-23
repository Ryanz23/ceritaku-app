// View daftar cerita dengan peta dan marker
import { renderMap } from '../utils/map.js';

export function storyListView(stories, { onArchive, onSave } = {}) {
  const section = document.createElement('section');
  section.className = 'story-list';
  section.setAttribute('aria-label', 'Daftar Cerita');

  stories.forEach(story => {
    const card = document.createElement('article');
    card.className = 'story-card';
    card.innerHTML = `
      <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" loading="lazy">
      <h2><i class="fa-solid fa-user"></i> ${story.name}</h2>
      <p>${story.description}</p>
      <p><i class="fa-solid fa-calendar"></i> <strong>Tanggal:</strong> ${new Date(story.createdAt).toLocaleString()}</p>
      <div><i class="fa-solid fa-map-marker-alt"></i> Lokasi:</div>
      <div class="story-map" id="map-${story.id}" style="height:220px;"></div>
      <div class="story-buttons">
        ${onSave ? `<button class="save-btn" aria-label="Simpan cerita offline">Simpan</button>` : ''}
        ${onArchive ? `<button class="archive-btn" aria-label="Arsipkan cerita">Hapus</button>` : ''}
      </div>
    `;

    section.appendChild(card);
    setTimeout(() => renderMap(`map-${story.id}`, story.lat, story.lon, story.name, story.description), 0);

    if (onArchive) {
      card.querySelector('.archive-btn').onclick = () => {
        if (confirm('Hapus cerita ini?')) {
          onArchive(story.id);
        }
      };
    }

    if (onSave) {
      card.querySelector('.save-btn').onclick = () => {
        saveStoryOffline(story);
        onSave(story);
      };
    }
  });

  return section;
}

function saveStoryOffline(story) {
  const savedStories = JSON.parse(localStorage.getItem('offlineStories')) || [];
  const exists = savedStories.some(s => s.id === story.id);
  
  if (!exists) {
    const storyWithSaveDate = { ...story, savedAt: new Date().toISOString() };
    savedStories.push(storyWithSaveDate);
    localStorage.setItem('offlineStories', JSON.stringify(savedStories));
    
    console.log('Memanggil showToast: Cerita berhasil disimpan offline!');
    showToast('Cerita berhasil disimpan offline!');
  } else {
    console.log('Memanggil showToast: Cerita sudah tersimpan');
    showToast('Cerita sudah tersimpan', 'error');
  }
}

// Add this function at the bottom of storyListView.js
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    margin-top: 10px;
    padding: 12px 20px;
    background: ${type === 'error' ? '#ff6b6b' : '#1dd1a1'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    animation: fadeIn 0.3s;
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  toastContainer.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

