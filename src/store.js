import { create } from 'zustand';

const useStore = create((set) => ({
  currentDate: new Date(),
  view: 'month', // 'month' | 'week' | 'day'
  selectedEntities: [], // Array of entity IDs to filter
  theme: 'light',
  language: 'it',
  
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setLanguage: (language) => set({ language }),
  toggleEntityFilter: (entityId) => set((state) => ({
    selectedEntities: state.selectedEntities.includes(entityId)
      ? state.selectedEntities.filter(id => id !== entityId)
      : [...state.selectedEntities, entityId]
  })),
  setSelectedEntities: (entities) => set({ selectedEntities: entities }),
}));

export default useStore;
