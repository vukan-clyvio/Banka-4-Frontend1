import { create } from 'zustand';

export const useAuthStore = create(set => ({
  user:  null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  initFromStorage: () => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (token) set({ token, user });
  },
}));
