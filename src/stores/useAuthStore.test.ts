import { describe, it, expect, beforeEach } from 'bun:test';
import { useAuthStore } from './useAuthStore';

describe('Zustand useAuthStore Tests', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthModalOpen: false,
      authModalTab: 'login',
      guestToken: 'test-guest-token-123'
    });
  });

  it('should initialize with default guest state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthModalOpen).toBe(false);
    expect(state.authModalTab).toBe('login');
    expect(state.guestToken).toBe('test-guest-token-123');
  });

  it('should open and close auth modal with correct tab', () => {
    const { openAuthModal, closeAuthModal } = useAuthStore.getState();

    openAuthModal('register');
    let state = useAuthStore.getState();
    expect(state.isAuthModalOpen).toBe(true);
    expect(state.authModalTab).toBe('register');

    openAuthModal('login');
    state = useAuthStore.getState();
    expect(state.isAuthModalOpen).toBe(true);
    expect(state.authModalTab).toBe('login');

    closeAuthModal();
    state = useAuthStore.getState();
    expect(state.isAuthModalOpen).toBe(false);
  });

  it('should update user state on direct set and clear on logout', async () => {
    useAuthStore.setState({
      user: {
        id: 'usr-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        authProvider: 'local',
        createdAt: new Date().toISOString()
      }
    });

    expect(useAuthStore.getState().user?.email).toBe('test@example.com');
    expect(useAuthStore.getState().user?.role).toBe('user');

    // Simulate logout
    useAuthStore.setState({ user: null });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should open and close logout confirm modal', () => {
    const { openLogoutConfirm, closeLogoutConfirm } = useAuthStore.getState();

    expect(useAuthStore.getState().isLogoutConfirmOpen).toBe(false);

    openLogoutConfirm();
    expect(useAuthStore.getState().isLogoutConfirmOpen).toBe(true);

    closeLogoutConfirm();
    expect(useAuthStore.getState().isLogoutConfirmOpen).toBe(false);
  });
});
