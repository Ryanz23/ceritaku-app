import { showLogin } from './presenter/loginPresenter.js';
import { showRegister } from './presenter/registerPresenter.js';
import { showStories } from './presenter/storyPresenter.js';
import { showAddStory } from './presenter/addStoryPresenter.js';
import { OfflineStoryPresenter } from './presenter/offlineStoryPresenter.js';

const routes = {
  '/': showLogin,
  '/login': showLogin,
  '/register': showRegister,
  '/stories': showStories,
  '/add': showAddStory,
  '/offline': OfflineStoryPresenter.prototype.displayOfflineStories.bind(new OfflineStoryPresenter()),
};

function initRouter() {
  const main = document.querySelector('main');
  const hash = location.hash.slice(1).toLowerCase() || '/';
  const render = routes[hash];

  if (render) {
    render(main);
  } else {
    main.innerHTML = '<p>404 Halaman tidak ditemukan</p>';
  }
}

window.addEventListener('hashchange', initRouter);
window.addEventListener('load', initRouter);

export { initRouter };