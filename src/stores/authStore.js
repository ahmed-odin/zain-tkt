import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const authError = ref(null);

  const initializeAuth = () => {
    const stored = localStorage.getItem('tktzain_auth');
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        currentUser.value = user;
        isAuthenticated.value = !!token;
        if (token) {
          localStorage.setItem('auth_token', token);
        }
      } catch {
        clearAuth();
      }
    }
  };

  const setAuth = (user, token) => {
    currentUser.value = user;
    isAuthenticated.value = true;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('tktzain_auth', JSON.stringify({ user, token }));
  };

  const clearAuth = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('tktzain_auth');
  };

  const login = async (identifier, password) => {
    isLoading.value = true;
    authError.value = null;

    const payload = { password };
    if (identifier.includes('@')) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    try {
      const response = await api.post('/auth/login', payload);

      const { token, user } = response.data;
      setAuth(user, token);

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      authError.value = message;
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors on logout
    }

    clearAuth();
  };

  const username = computed(() => currentUser.value?.name || '');
  const isLoggedIn = computed(() => isAuthenticated.value);

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    authError,
    username,
    isLoggedIn,
    initializeAuth,
    login,
    logout
  };
});
