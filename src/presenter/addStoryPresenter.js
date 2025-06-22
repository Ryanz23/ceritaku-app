import { addStory } from '../model/storyModel.js';
import { addStoryView } from '../view/addStoryView.js';

export function showAddStory(main) {
  const { element, cleanup } = addStoryView({
    onSubmit: async (data) => {
      try {
        await addStory(data);
        alert('Cerita berhasil ditambahkan!');

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          registration.active.postMessage({
            type: 'NEW_STORY_PUSH',
            data: {
              title: '🎉 Cerita Baru!',
              body: 'Cerita Anda berhasil ditambahkan.',
              url: '/#/stories'
            }
          });
        }

        location.hash = '#/stories';
      } catch (err) {
        alert(err.message);
      }
    }
  });

  main.innerHTML = '';
  main.appendChild(element);
  window.__currentCleanup = cleanup;
}
