import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      student: null,
      token: null,
      isAuthenticated: false,
      login: (student, token) =>
        set({ student, token, isAuthenticated: true }),
      logout: () =>
        set({ student: null, token: null, isAuthenticated: false }),
    }),
    { name: 'class-reservation-auth' }
  )
);
