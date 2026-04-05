import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/app/page';
import '@testing-library/jest-dom/vitest';

vi.mock('@/components/providers', () => ({
  useApp: () => ({
    t: (key: string) => key,
    lang: 'zh',
    setLang: vi.fn(),
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    { id: 1, name: 'Test Project', type: 'Chrome Extension', tech: 'React', description: 'Test', progress: 50, status: 'active', createdAt: '2024-01-01', tasks: [] },
  ]),
  addProject: vi.fn().mockResolvedValue({}),
  deleteProject: vi.fn().mockResolvedValue({}),
}));

describe('Project Manager App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Project List', () => {
    it('should render project name', async () => {
      render(<App />);
      await new Promise(r => setTimeout(r, 100));
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should display project type', async () => {
      render(<App />);
      await new Promise(r => setTimeout(r, 100));
      expect(screen.getByText('Chrome Extension')).toBeInTheDocument();
    });

    it('should display progress', async () => {
      render(<App />);
      await new Promise(r => setTimeout(r, 100));
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should display status chip', async () => {
      render(<App />);
      await new Promise(r => setTimeout(r, 100));
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  describe('AddProjectModal', () => {
    it('should open modal when add button clicked', async () => {
      render(<App />);
      await new Promise(r => setTimeout(r, 100));
      
      const addButton = screen.getByText('addProject');
      fireEvent.click(addButton);
      
      await new Promise(r => setTimeout(r, 300));
      expect(screen.getAllByText('projectName').length).toBeGreaterThan(0);
    });
  });
});