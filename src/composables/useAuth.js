import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const authStore = useAuthStore();

  const login = (username, password) => {
    return authStore.login(username, password);
  };

  const logout = () => {
    authStore.logout();
  };

  const isLoggedIn = () => {
    return authStore.isLoggedIn;
  };

  const getCurrentUser = () => {
    return authStore.currentUser;
  };

  return {
    login,
    logout,
    isLoggedIn,
    getCurrentUser
  };
}
