import { 
  getOfflineStories, 
  deleteStory, 
  saveStory, 
} from '../utils/indexedDB.js';

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

  init(mainElement) {
    this.mainElement = mainElement;
  }

  async displayOfflineStories() {
    if (!this.mainElement) {
      console.error('Main element not initialized');
      return;
    }

    try {
      showLoadingState(this.mainElement);

      const offlineStories = await getOfflineStories();

      showOfflineStories(
        this.mainElement,
        offlineStories,
        this.handleDeleteStory.bind(this)
      );

    } catch (error) {
      console.error('Error loading offline stories:', error);
      showErrorState(this.mainElement, error);
    }
  }

  async handleDeleteStory(storyId) {
    try {
      await deleteStory(storyId);
      showToast('Story berhasil dihapus', 'success');
      setTimeout(() => this.displayOfflineStories(), 300);
    } catch (error) {
      console.error('Error deleting story:', error);
      showToast('Gagal menghapus story', 'error');
      this.displayOfflineStories();
    }
  }

  async saveUserStory(storyData) {
    try {
      if (!storyData.name || !storyData.description) {
        throw new Error('Nama dan deskripsi story harus diisi');
      }

      const storyToSave = {
        id: `offline-${Date.now()}`,
        name: storyData.name.trim(),
        description: storyData.description.trim(),
        content: storyData.content || storyData.description,
        photoUrl: storyData.photoUrl || '',
        createdAt: new Date().toISOString(),
        savedAt: new Date().toISOString(),
        isOffline: true,
        source: 'user',
        ...storyData
      };

      await saveStory(storyToSave);
      showToast('Story berhasil disimpan offline!', 'success');
      return storyToSave;

    } catch (error) {
      console.error('Error saving user story:', error);
      showToast(`Gagal menyimpan story: ${error.message}`, 'error');
      throw error;
    }
  }
}

export const offlineStoryPresenter = new OfflineStoryPresenter();
