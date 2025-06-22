import { getStories, archiveStory, getArchivedStories } from '../model/storyModel.js';
import { storyListView } from '../view/storyListView.js';
import { saveStory } from '../utils/indexedDB.js';
import { showToast } from '../view/offlineView.js';
import { offlineStoryPresenter } from './offlineStoryPresenter.js';

async function handleArchive(id, main) {
  await archiveStory(id);
  await showStories(main);
}

async function handleSave(story, main) {
  try {
    const storyToSave = {
      ...story,
      isOffline: true,
      savedAt: new Date().toISOString(),
      source: 'api'
    };
    await saveStory(storyToSave);
    showToast('✅ Cerita disimpan ke offline', 'success');
    if (document.querySelector('.offline-container')) {
      await offlineStoryPresenter.displayOfflineStories();
    }
  } catch (err) {
    showToast('❌ Gagal menyimpan cerita: ' + err.message, 'error');
  }
}

export async function showStories(main) {
  main.innerHTML = '<p>📦 Memuat cerita...</p>';

  try {
    const stories = await getStories();
    const archived = (await getArchivedStories()) || [];
    const visibleStories = stories.filter(story => !archived.includes(story.id));

    const view = storyListView(visibleStories, {
      onArchive: id => handleArchive(id, main),
      onSave: story => handleSave(story, main),
    });

    main.innerHTML = '';
    main.appendChild(view);
  } catch (error) {
    console.error('❌ Gagal memuat cerita:', error);
    const isAuthError = error.message.toLowerCase().includes('unauthorized') || error.message.includes('401');
    main.innerHTML = `<p>❌ ${isAuthError ? 'Gagal memuat cerita. Silakan login terlebih dahulu.' : 'Gagal memuat cerita.'}</p>`;
  }
}