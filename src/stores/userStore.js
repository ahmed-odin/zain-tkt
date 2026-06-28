import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

const extractError = (err, fallback) => {
  const data = err.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first.length) return first[0];
  }
  return data?.message || fallback;
};

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get('/users');
      users.value = res.data.users || [];
      return users.value;
    } catch (err) {
      error.value = extractError(err, 'Unable to load users');
      return [];
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (payload) => {
    error.value = null;
    try {
      const res = await api.post('/users', payload);
      users.value.unshift(res.data.user);
      return res.data.user;
    } catch (err) {
      error.value = extractError(err, 'Unable to create user');
      return null;
    }
  };

  const updateUser = async (id, payload) => {
    error.value = null;
    try {
      const res = await api.put(`/users/${id}`, payload);
      users.value = users.value.map((u) => (u.id === id ? res.data.user : u));
      return res.data.user;
    } catch (err) {
      error.value = extractError(err, 'Unable to update user');
      return null;
    }
  };

  const deleteUser = async (id) => {
    error.value = null;
    try {
      await api.delete(`/users/${id}`);
      users.value = users.value.filter((u) => u.id !== id);
      return true;
    } catch (err) {
      error.value = extractError(err, 'Unable to delete user');
      return false;
    }
  };

  return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser };
});
