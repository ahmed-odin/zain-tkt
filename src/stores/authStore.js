import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const isAuthenticated = ref(false);

  // Check if user is already logged in (from localStorage)
  const initializeAuth = () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const { currentUser: user } = JSON.parse(auth);
        currentUser.value = user;
        isAuthenticated.value = true;
      } catch {
        // Invalid data, clear it
        localStorage.removeItem('auth');
      }
    }
  };

  // Login with username and password
  const login = (username, password) => {
    // Default credentials check
    if (username === 'admin' && password === 'admin') {
      currentUser.value = username;
      isAuthenticated.value = true;
      
      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify({
        currentUser: username,
        timestamp: Date.now()
      }));
      
      return true;
    }
    return false;
  };

  // Logout
  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth');
  };

  // Computed getters
  const username = computed(() => currentUser.value);
  const isLoggedIn = computed(() => isAuthenticated.value);

  return {
    currentUser,
    isAuthenticated,
    username,
    isLoggedIn,
    initializeAuth,
    login,
    logout
  };
});
