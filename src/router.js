import { showLogin } from './presenter/loginPresenter.js';
import { showRegister } from './presenter/registerPresenter.js';
import { showStories } from './presenter/storyPresenter.js';
import { showAddStory } from './presenter/addStoryPresenter.js';
import { showOfflineStories } from './view/offlineView.js';
import { OfflineStoryPresenter } from './presenter/offlineStoryPresenter.js';
import { getOfflineStories } from './utils/indexedDB.js';

const routes = {
  '': showLogin,
  'login': showLogin,
  'register': showRegister,
  'stories': showStories,
  'add': showAddStory,
  'saved': showOfflineStories,
};

const offlineStoryPresenter = new OfflineStoryPresenter();

async function initRouter() {
  const main = document.querySelector('main');
  const hash = location.hash.replace(/^#\/?/, '').toLowerCase() || '';
  console.log('Current route:', hash);

  if (hash === 'offline') {
    offlineStoryPresenter.init(main);
    showOfflineStories.showLoadingState(main);

    try {
      const offlineStories = await getOfflineStories();
      showOfflineStories(main, offlineStories, async (storyId) => {
        await offlineStoryPresenter.handleDeleteStory(storyId);
      });
    } catch (error) {
      showOfflineStories.showErrorState(main, error);
    }
  } else if (routes[hash]) {
    console.log('Route found:', hash);
    await routes[hash](main);
  } else {
    console.log('Route not found:', hash);
    main.innerHTML = '<p>404 Halaman tidak ditemukan</p>';
  }
}


window.addEventListener('hashchange', initRouter);
window.addEventListener('load', initRouter);

export { initRouter };
