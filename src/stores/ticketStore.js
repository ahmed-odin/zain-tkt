import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

const mapTicket = (ticket) => ({
  id: ticket.id,
  ticketId: ticket.ticket_id,
  missdn: ticket.missdn,
  governorate: ticket.governorate,
  comments: ticket.comments || '',
  problemDescription: ticket.alwaseet_company || '',
  status: ticket.status,
  createdById: ticket.created_by,
  createdBy: ticket.creator?.name || ticket.creator?.email || 'Unknown',
  completedBy: ticket.completer?.name || ticket.completer?.email || ticket.completed_by || '—',
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
  completedAt: ticket.completed_at,
  timeline: (ticket.activities || []).map((activity) => ({
    id: activity.id,
    action: activity.action,
    fields: activity.changes?.fields || [],
    note: activity.changes?.reason || activity.changes?.reply || '',
    by: activity.user?.name || activity.user?.email || 'Unknown',
    at: activity.created_at,
  })),
});

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const setTickets = (data) => {
    tickets.value = data.map(mapTicket);
  };

  const fetchPendingTickets = async (params = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/tickets/pending', { params });
      setTickets(response.data.tickets);
      return response.data.meta || null;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to load pending tickets';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchCompletedTickets = async (params = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/tickets/completed', { params });
      setTickets(response.data.tickets);
      return response.data.meta || null;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to load completed tickets';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Fetch a list without mutating the store (used for Excel export of all matches).
  const fetchCompletedForExport = async (params = {}) => {
    try {
      const response = await api.get('/tickets/completed', {
        params: { ...params, per_page: 100, page: 1 },
      });
      let rows = response.data.tickets.map(mapTicket);
      const meta = response.data.meta;
      // Pull remaining pages if the result spans more than one.
      if (meta && meta.last_page > 1) {
        for (let p = 2; p <= meta.last_page; p++) {
          const next = await api.get('/tickets/completed', { params: { ...params, per_page: 100, page: p } });
          rows = rows.concat(next.data.tickets.map(mapTicket));
        }
      }
      return rows;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to export tickets';
      return [];
    }
  };

  const fetchPendingForExport = async (params = {}) => {
    try {
      const response = await api.get('/tickets/pending', {
        params: { ...params, per_page: 100, page: 1 },
      });
      let rows = response.data.tickets.map(mapTicket);
      const meta = response.data.meta;
      // Pull remaining pages if the result spans more than one.
      if (meta && meta.last_page > 1) {
        for (let p = 2; p <= meta.last_page; p++) {
          const next = await api.get('/tickets/pending', { params: { ...params, per_page: 100, page: p } });
          rows = rows.concat(next.data.tickets.map(mapTicket));
        }
      }
      return rows;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to export tickets';
      return [];
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/tickets/filter-users');
      return {
        users: response.data.users || [],
        governorates: response.data.governorates || [],
      };
    } catch {
      return { users: [], governorates: [] };
    }
  };

  const createTicket = async (ticketData) => {
    loading.value = true;
    error.value = null;

    try {
      const payload = {
        missdn: ticketData.missdn,
        governorate: ticketData.governorate,
        comments: ticketData.comments,
        status: ticketData.status || 'Pending',
      };
      const response = await api.post('/tickets', payload);
      const ticket = mapTicket(response.data.ticket);
      tickets.value.unshift(ticket);
      return ticket;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to create ticket';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const bulkCreateTickets = async (newTickets) => {
    loading.value = true;
    error.value = null;

    try {
      const payload = {
        tickets: newTickets.map((ticket) => ({
          missdn: ticket.missdn,
          governorate: ticket.governorate,
          comments: ticket.comments || null,
        })),
      };
      const response = await api.post('/tickets/bulk', payload);
      return response.data.count ?? newTickets.length;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to import tickets';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateTicket = async (id, updates) => {
    loading.value = true;
    error.value = null;

    try {
      const payload = {
        missdn: updates.missdn,
        governorate: updates.governorate,
        comments: updates.comments,
        status: updates.status,
        alwaseet_company: updates.problemDescription,
        reopen_reason: updates.reopenReason,
      };
      const response = await api.put(`/tickets/${id}`, payload);
      const updatedTicket = mapTicket(response.data.ticket);
      tickets.value = tickets.value.map((ticket) => ticket.id === id ? updatedTicket : ticket);
      return updatedTicket;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to update ticket';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const markComplete = async (id, alwaseetCompany) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post(`/tickets/${id}/complete`, {
        alwaseet_company: alwaseetCompany,
      });
      const completedTicket = mapTicket(response.data.ticket);
      tickets.value = tickets.value.filter((ticket) => ticket.id !== id);
      return completedTicket;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to complete ticket';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteTicket = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await api.delete(`/tickets/${id}`);
      tickets.value = tickets.value.filter((ticket) => ticket.id !== id);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to delete ticket';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const replyTicket = async (id, reply) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post(`/tickets/${id}/reply`, { reply });
      const updated = mapTicket(response.data.ticket);
      tickets.value = tickets.value.map((ticket) => (ticket.id === id ? updated : ticket));
      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to send reply';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getTicketById = (id) => {
    return tickets.value.find((ticket) => ticket.id === id);
  };

  const searchTickets = (query = '') => {
    const lower = query.trim().toLowerCase();
    if (!lower) {
      return tickets.value;
    }
    return tickets.value.filter((ticket) => {
      return (
        ticket.missdn.toLowerCase().includes(lower) ||
        ticket.governorate.toLowerCase().includes(lower) ||
        ticket.comments.toLowerCase().includes(lower) ||
        ticket.problemDescription.toLowerCase().includes(lower)
      );
    });
  };

  const getTicketStats = () => ({
    total: tickets.value.length,
    pending: tickets.value.filter((t) => t.status === 'Pending').length,
    complete: tickets.value.filter((t) => t.status === 'Complete').length,
  });

  const getGovernorateStats = () => {
    const stats = {};
    tickets.value.forEach((ticket) => {
      stats[ticket.governorate] = (stats[ticket.governorate] || 0) + 1;
    });
    return stats;
  };

  const allTickets = computed(() => tickets.value);
  const ticketStats = computed(() => getTicketStats());

  return {
    tickets,
    loading,
    error,
    allTickets,
    ticketStats,
    fetchPendingTickets,
    fetchCompletedTickets,
    fetchCompletedForExport,
    fetchPendingForExport,
    fetchFilterOptions,
    createTicket,
    bulkCreateTickets,
    updateTicket,
    markComplete,
    replyTicket,
    deleteTicket,
    getTicketById,
    searchTickets,
    getGovernorateStats,
  };
});
