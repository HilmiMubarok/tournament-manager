import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true, // Default is visible on desktop
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      open: () => set({ isOpen: true }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);
