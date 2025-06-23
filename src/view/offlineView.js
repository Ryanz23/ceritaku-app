import { renderMap } from '../utils/map.js';

export const showOfflineStories = (main, stories, onDelete) => {
  if (!stories || stories.length === 0) {
    main.innerHTML = `
      <div class="offline-container">
        <h2>Story Offline</h2>
        <div class="no-stories">
          <div class="no-stories-icon">📚</div>
          <p>Belum ada story yang disimpan offline</p>
          <p>Silahkan refresh halaman ini atau kembali ke halaman cerita untuk menyimpan story.</p>
          <small>Story yang Anda simpan akan muncul di sini</small>
        </div>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="offline-container">
      <h2>Story Offline</h2>
      <div class="stories-count">
        <span>${stories.length} story tersimpan</span>
      </div>
      <div class="stories-list">
        ${stories.map(story => `
          <div class="story-card">
            <div class="story-header">
              <h3>${story.name || 'Untitled Story'}</h3>
              <button data-id="${story.id}" class="delete-btn" title="Hapus Story">×</button>
            </div>
            <p class="story-description">${story.description || ''}</p>
            ${story.photoUrl ? `
              <div class="story-image-container">
                <img src="${story.photoUrl}" alt="${story.name || 'Story Image'}" class="story-image" />
              </div>
            ` : ''}
            <div class="story-footer">
              <span class="story-date">Disimpan pada: ${new Date(story.savedAt).toLocaleString()}</span>
            </div>
            <div class="story-map" id="map-${story.id}" style="height:220px;"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  injectOfflineStyles();

  // Pasang event listener tombol hapus
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const storyId = btn.dataset.id;
      const storyName = btn.closest('.story-card').querySelector('h3').textContent;

      if (confirm(`Apakah Anda yakin ingin menghapus story "${storyName}"?`)) {
        btn.innerHTML = '⏳';
        btn.disabled = true;

        if (onDelete) {
          await onDelete(storyId);
        }
      }
    });
  });

  // Inisialisasi peta Leaflet dengan delay agar elemen sudah render sempurna
  stories.forEach(story => {
    if (story.lat && story.lon) {
      requestAnimationFrame(() => {
        renderMap(`map-${story.id}`, story.lat, story.lon, story.name, story.description);
      });         
    }
  });
};


// Show loading state
export const showLoadingState = (main) => {
  main.innerHTML = `
    <div class="offline-container">
      <h2>Story Offline</h2>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat story offline...</p>
      </div>
    </div>
  `;
  injectOfflineStyles();
};

// Show error state
export const showErrorState = (main, error) => {
  main.innerHTML = `
    <div class="offline-container">
      <h2>Story Offline</h2>
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>Terjadi kesalahan saat memuat story offline</p>
        <small>${error?.message || 'Unknown error'}</small>
        <button onclick="location.reload()" class="retry-btn">Coba Lagi</button>
      </div>
    </div>
  `;
  injectOfflineStyles();
};

// Show toast notification
export const showToast = (message, type = 'success') => {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
};

// Helper function untuk inject CSS styles
const injectOfflineStyles = () => {
  if (document.querySelector('#offline-view-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'offline-view-styles';
  style.textContent = `
    .offline-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .offline-container h2 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 2em;
      font-weight: 600;
    }
    
    .stories-count {
      text-align: center;
      margin-bottom: 30px;
      color: #7f8c8d;
      font-size: 0.9em;
    }
    
    .loading-state, .no-stories, .error-state {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      margin: 40px 0;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .no-stories-icon, .error-icon {
      font-size: 4em;
      margin-bottom: 20px;
      opacity: 0.6;
    }
    
    .stories-list {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      padding: 1rem;
    }

    .story-card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 10px;
    }

    .story-card {
      background: var(--neutral);
      border-radius: var(--radius);
      padding: 1rem;
      width: calc(33.333% - 1rem);
      box-shadow: 0 2px 10px var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: var(--transition);
    }
    
    .story-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-color: #007bff;
    }
    
    .story-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 12px;
    }
    
    .story-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.2em;
      font-weight: 600;
      line-height: 1.3;
      flex: 1;
      word-break: break-word;
    }
    
    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .delete-btn:hover {
      background: #c82333;
      transform: scale(1.1);
    }
    
    .delete-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .story-description {
      color: #495057;
      line-height: 1.6;
      margin: 0 0 12px 0;
      font-size: 0.95em;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .story-image-container {
      margin-top: 12px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .story-footer {
      border-top: 1px solid #f1f3f4;
      padding-top: 12px;
      margin-top: 16px;
    }

    .story-map {
      height: 220px;
      width: 100%;
    }
    
    .story-date {
      color: #6c757d;
      font-size: 0.85em;
    }
    
    .retry-btn {
      background: #ffc107;
      color: #212529;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      margin-top: 16px;
    }
    
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }
    
    .toast.success { background: #28a745; }
    .toast.error { background: #dc3545; }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @media (max-width: 768px) {
    .stories-list {
      gap: 16px;
    }
    .story-card {
      max-width: 100%;
      padding: 16px;
    }
    .story-image {
      height: 200px;
    }
  }
  `;
  
  document.head.appendChild(style);
};