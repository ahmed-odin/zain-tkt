import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const authStore = useAuthStore();

  const login = async (email, password) => {
    return authStore.login(email, password);
  };

  const logout = async () => {
    await authStore.logout();
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
