import { create } from 'zustand';
import type { CloneProject } from '../types';
import { cloneService } from '../services/CloneService';

interface ProjectStore {
  projects: CloneProject[];
  currentProject: CloneProject | null;
  isLoading: boolean;
  addProject: (project: CloneProject) => void;
  updateProject: (id: string, updates: Partial<CloneProject>) => void;
  setCurrentProject: (project: CloneProject | null) => void;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  unarchiveProject: (id: string) => Promise<void>;
  getProject: (id: string) => CloneProject | undefined;
  loadProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...updates } : state.currentProject,
    })),

  setCurrentProject: (project) =>
    set({
      currentProject: project,
    }),

  deleteProject: async (id) => {
    const success = await cloneService.deleteProject(id);
    if (success) {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
    }
  },

  archiveProject: async (id) => {
    const success = await cloneService.archiveProject(id);
    if (success) {
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, archived: true } : p)),
      }));
    }
  },

  unarchiveProject: async (id) => {
    const success = await cloneService.unarchiveProject(id);
    if (success) {
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, archived: false } : p)),
      }));
    }
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await cloneService.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ isLoading: false });
    }
  },
}));
