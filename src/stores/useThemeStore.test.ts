import { describe, it, expect, beforeEach } from 'bun:test';
import { useThemeStore } from './useThemeStore';

describe('Zustand useThemeStore Tests', () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme('light');
  });

  it('should initialize with default light theme', () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('light');
  });

  it('should toggle theme between light and dark', () => {
    const store = useThemeStore.getState();
    expect(store.theme).toBe('light');

    store.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');

    store.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should set specific theme directly', () => {
    const store = useThemeStore.getState();
    store.setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');

    store.setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });
});
