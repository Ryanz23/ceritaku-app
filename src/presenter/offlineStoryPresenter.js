// offlineStoryPresenter.js - Handle logic dan data
import { getAllStories, deleteStory, saveStory } from '../utils/indexedDB.js';
import { 
  showOfflineStories, 
  showLoadingState, 
  showErrorState, 
  showToast 
} from '../view/offlineView.js';

export class OfflineStoryPresenter {
  constructor() {
    this.mainElement = null;
  }

  // Inisialisasi presenter dengan main element
  init(mainElement) {
    this.mainElement = mainElement;
  }

  // Method utama untuk menampilkan offline stories
  async displayOfflineStories() {
    if (!this.mainElement) {
      console.error('Main element not initialized');
      return;
    }

    try {
      // Show loading state
      showLoadingState(this.mainElement);
      
      // Ambil semua stories dari database
      const allStories = await getAllStories();
      
      // Filter hanya story offline (yang disimpan user)
      const offlineStories = allStories.filter(story => {
        return story.isOffline === true || story.source === 'user';
      });

      // Sort berdasarkan waktu tersimpan (terbaru dulu)
      offlineStories.sort((a, b) => {
        const dateA = new Date(a.savedAt || a.createdAt || 0);
        const dateB = new Date(b.savedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      // Tampilkan stories melalui view
      showOfflineStories(
        this.mainElement, 
        offlineStories, 
        this.handleDeleteStory.bind(this)
      );

      console.log('Offline stories loaded:', offlineStories.length);

    } catch (error) {
      console.error('Error loading offline stories:', error);
      showErrorState(this.mainElement, error);
    }
  }

  // Handle delete story
  async handleDeleteStory(storyId) {
    try {
      await deleteStory(storyId);
      
      // Show success message
      showToast('Story berhasil dihapus', 'success');
      
      // Refresh tampilan setelah delete
      setTimeout(() => {
        this.displayOfflineStories();
      }, 500);
      
    } catch (error) {
      console.error('Error deleting story:', error);
      showToast('Gagal menghapus story', 'error');
      
      // Refresh tampilan untuk reset button state
      this.displayOfflineStories();
    }
  }

  // Save story dari user input
  async saveUserStory(storyData) {
    try {
      // Validasi input
      if (!storyData.name || !storyData.description) {
        throw new Error('Nama dan deskripsi story harus diisi');
      }

      // Prepare data untuk disimpan
      const storyToSave = {
        id: `offline-${Date.now()}`,
        name: storyData.name.trim(),
        description: storyData.description.trim(),
        content: storyData.content || storyData.description,
        photoUrl: storyData.photoUrl || '',
        createdAt: new Date().toISOString(),
        savedAt: new Date().toISOString(),
        isOffline: true,
        source: 'user'
      };

      // Simpan ke database
      await saveStory(storyToSave);
      
      console.log('User story saved successfully:', storyToSave);
      showToast('Story berhasil disimpan offline!', 'success');
      
      return storyToSave;
      
    } catch (error) {
      console.error('Error saving user story:', error);
      showToast(`Gagal menyimpan story: ${error.message}`, 'error');
      throw error;
    }
  }

  // Get offline stories count
  async getOfflineStoriesCount() {
    try {
      const allStories = await getAllStories();
      const offlineStories = allStories.filter(story => 
        story.isOffline === true || story.source === 'user'
      );
      return offlineStories.length;
    } catch (error) {
      console.error('Error getting offline stories count:', error);
      return 0;
    }
  }

  // Clear all offline stories
  async clearAllOfflineStories() {
    try {
      const allStories = await getAllStories();
      const offlineStories = allStories.filter(story => 
        story.isOffline === true || story.source === 'user'
      );

      // Delete each offline story
      for (const story of offlineStories) {
        await deleteStory(story.id);
      }

      showToast(`${offlineStories.length} story offline berhasil dihapus`, 'success');
      
      // Refresh tampilan
      this.displayOfflineStories();
      
    } catch (error) {
      console.error('Error clearing offline stories:', error);
      showToast('Gagal menghapus story offline', 'error');
    }
  }

  // Export offline stories (optional feature)
  async exportOfflineStories() {
    try {
      const allStories = await getAllStories();
      const offlineStories = allStories.filter(story => 
        story.isOffline === true || story.source === 'user'
      );

      if (offlineStories.length === 0) {
        showToast('Tidak ada story offline untuk diekspor', 'error');
        return;
      }

      // Create JSON data
      const exportData = {
        exportDate: new Date().toISOString(),
        storiesCount: offlineStories.length,
        stories: offlineStories
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offline-stories-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Story offline berhasil diekspor', 'success');
      
    } catch (error) {
      console.error('Error exporting offline stories:', error);
      showToast('Gagal mengekspor story offline', 'error');
    }
  }

  // Debug method untuk melihat isi database
  async debugDatabase() {
    try {
      const allStories = await getAllStories();
      const offlineStories = allStories.filter(story => 
        story.isOffline === true || story.source === 'user'
      );
      const apiStories = allStories.filter(story => 
        story.source === 'api' || story.isOffline === false
      );

      console.log('=== DATABASE DEBUG ===');
      console.log('Total stories:', allStories.length);
      console.log('Offline stories:', offlineStories.length);
      console.log('API stories:', apiStories.length);
      console.log('All stories:', allStories);
      console.log('Offline stories:', offlineStories);
      console.log('======================');
      
      return {
        total: allStories.length,
        offline: offlineStories.length,
        api: apiStories.length,
        data: allStories
      };
    } catch (error) {
      console.error('Error debugging database:', error);
      return null;
    }
  }
}

// Export instance untuk digunakan di aplikasi
export const offlineStoryPresenter = new OfflineStoryPresenter();