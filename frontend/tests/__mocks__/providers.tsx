import { ReactNode } from 'react';
import { useApp } from '@/components/providers';

vi.mock('@/components/providers', () => ({
  useApp: () => ({
    t: (key: string) => key,
    lang: 'zh',
    setLang: vi.fn(),
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

export function TestProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}