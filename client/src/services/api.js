import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Novel API calls
export const novelApi = {
  // Get all novels
  getNovels: async () => {
    try {
      const response = await api.get('/novels');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Get a novel by ID
  getNovel: async (id) => {
    try {
      const response = await api.get(`/novels/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Create a new novel
  createNovel: async (novelData) => {
    try {
      const response = await api.post('/novels', novelData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Update a novel
  updateNovel: async (id, novelData) => {
    try {
      const response = await api.put(`/novels/${id}`, novelData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Delete a novel
  deleteNovel: async (id) => {
    try {
      const response = await api.delete(`/novels/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};

// Chapter API calls
export const chapterApi = {
  // Get all chapters for a novel
  getChapters: async (novelId) => {
    try {
      const response = await api.get(`/novels/${novelId}/chapters`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Get a chapter by ID
  getChapter: async (id) => {
    try {
      const response = await api.get(`/chapters/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Create a new chapter
  createChapter: async (novelId, chapterData) => {
    try {
      const response = await api.post(`/novels/${novelId}/chapters`, chapterData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Update a chapter
  updateChapter: async (id, chapterData) => {
    try {
      const response = await api.put(`/chapters/${id}`, chapterData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Delete a chapter
  deleteChapter: async (id) => {
    try {
      const response = await api.delete(`/chapters/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};

// Translation API calls
export const translationApi = {
  // Translate a chapter
  translateChapter: async (novelId, chapterId) => {
    try {
      const response = await api.post(`/novels/${novelId}/chapters/${chapterId}/translate`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Get detected names for a chapter
  getDetectedNames: async (novelId, chapterId) => {
    try {
      const response = await api.get(`/novels/${novelId}/chapters/${chapterId}/detected-names`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Resolve detected names
  resolveNames: async (novelId, chapterId, resolvedNames) => {
    try {
      const response = await api.put(`/novels/${novelId}/chapters/${chapterId}/resolve-names`, {
        resolvedNames,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};

// Name mapping API calls
export const nameApi = {
  // Get all name mappings for a novel
  getNameMappings: async (novelId) => {
    try {
      const response = await api.get(`/novels/${novelId}/names`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Create a new name mapping
  createNameMapping: async (novelId, nameData) => {
    try {
      const response = await api.post(`/novels/${novelId}/names`, nameData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Update a name mapping
  updateNameMapping: async (id, nameData) => {
    try {
      const response = await api.put(`/names/${id}`, nameData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Delete a name mapping
  deleteNameMapping: async (id) => {
    try {
      const response = await api.delete(`/names/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};

export default {
  novelApi,
  chapterApi,
  translationApi,
  nameApi,
};
