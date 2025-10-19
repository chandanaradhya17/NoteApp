import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface INote {
  _id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

// Axios interceptor to attach token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export const noteService = {
  async createNote(userId: string, title: string, content: string): Promise<INote> {
    const response = await axios.post(`${API_URL}/notes`, { userId, title, content });
    return response.data;
  },

  async getNotes(userId: string): Promise<INote[]> {
    const response = await axios.get(`${API_URL}/notes/${userId}`);
    return response.data;
  },

  async deleteNote(noteId: string): Promise<void> {
    await axios.delete(`${API_URL}/notes/${noteId}`);
  },
};
