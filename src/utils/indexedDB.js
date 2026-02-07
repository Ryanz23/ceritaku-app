import { openDB } from 'idb';

const DB_NAME = 'ceritaku-db';
const STORE_NAME = 'stories';
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      
      // Buat index untuk pencarian dan sorting
      store.createIndex('savedAt', 'savedAt', { unique: false });
      store.createIndex('isOffline', 'isOffline', { unique: false });
      store.createIndex('name', 'name', { unique: false });
    }
  },
});

// Simpan story dengan data yang lebih lengkap
export const saveStory = async (story) => {
  try {
    const db = await dbPromise;
    
    // Pastikan story memiliki struktur data yang benar
    const storyToSave = {
      id: story.id || `offline-${Date.now()}`, // Beri prefix untuk story offline
      name: story.name || story.title || 'Untitled Story',
      description: story.description || story.content || '',
      content: story.content || story.description || '',
      photoUrl: story.photoUrl || story.photo || '',
      createdAt: story.createdAt || new Date().toISOString(),
      savedAt: new Date().toISOString(), // Timestamp saat disimpan
      isOffline: true, // Flag untuk menandai ini story offline
      source: 'user', // Sumber: 'user' untuk yang disave user, 'api' untuk dari API
      ...story // Spread untuk mempertahankan properti lainnya
    };
    
    await db.put(STORE_NAME, storyToSave);
    console.log('Story saved successfully:', storyToSave);
    return storyToSave;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
};

// Ambil semua stories
export const getAllStories = async () => {
  try {
    const db = await dbPromise;
    const stories = await db.getAll(STORE_NAME);
    
    // Sort berdasarkan waktu tersimpan (terbaru dulu)
    return stories.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch (error) {
    console.error('Error getting all stories:', error);
    return [];
  }
};

// Ambil hanya stories yang disave oleh user (offline)
export const getOfflineStories = async () => {
  try {
    const db = await dbPromise;
    const stories = await db.getAll(STORE_NAME); // Ambil semua data
    
    // Filter stories yang isOffline === true secara manual
    const offlineStories = stories.filter(story => story.isOffline === true);
    
    // Sort berdasarkan waktu tersimpan (terbaru dulu)
    return offlineStories.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch (error) {
    console.error('Error getting offline stories:', error);
    return [];
  }
};


// Ambil stories dari API (untuk cache)
export const getApiStories = async () => {
  try {
    const db = await dbPromise;
    const stories = await db.getAll(STORE_NAME);
    
    // Filter hanya yang dari API
    return stories.filter(story => story.source === 'api');
  } catch (error) {
    console.error('Error getting API stories:', error);
    return [];
  }
};

// Simpan stories dari API (untuk cache)
export const saveApiStories = async (stories) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    
    for (const story of stories) {
      const apiStory = {
        ...story,
        id: `api-${story.id}`, // Beri prefix untuk story dari API
        savedAt: new Date().toISOString(),
        isOffline: false,
        source: 'api'
      };
      
      await tx.store.put(apiStory);
    }
    
    await tx.done;
    console.log('API stories cached successfully');
  } catch (error) {
    console.error('Error saving API stories:', error);
  }
};

// Ambil story berdasarkan ID
export const getStoryById = async (id) => {
  try {
    const db = await dbPromise;
    return await db.get(STORE_NAME, id);
  } catch (error) {
    console.error('Error getting story by ID:', error);
    return null;
  }
};

// Hapus story
export const deleteStory = async (id) => {
  try {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
    console.log('Story deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// Hapus semua stories offline (user stories)
export const clearOfflineStories = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('isOffline');
    
    const keys = await index.getAllKeys(true);
    
    for (const key of keys) {
      await store.delete(key);
    }
    
    await tx.done;
    console.log('All offline stories cleared');
  } catch (error) {
    console.error('Error clearing offline stories:', error);
    throw error;
  }
};

// Hapus semua stories dari API cache
export const clearApiCache = async () => {
  try {
    const db = await dbPromise;
    const stories = await db.getAll(STORE_NAME);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    
    for (const story of stories) {
      if (story.source === 'api') {
        await tx.store.delete(story.id);
      }
    }
    
    await tx.done;
    console.log('API cache cleared');
  } catch (error) {
    console.error('Error clearing API cache:', error);
  }
};

// Debug: lihat semua data di database
export const debugDatabase = async () => {
  try {
    const db = await dbPromise;
    const stories = await db.getAll(STORE_NAME);
    
    console.log('=== DATABASE DEBUG ===');
    console.log('Total stories:', stories.length);
    console.log('Offline stories:', stories.filter(s => s.isOffline).length);
    console.log('API stories:', stories.filter(s => s.source === 'api').length);
    console.log('All stories:', stories);
    console.log('=====================');
    
    return stories;
  } catch (error) {
    console.error('Error debugging database:', error);
    return [];
  }
};