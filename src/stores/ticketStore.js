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
  createdBy: ticket.creator?.name || ticket.creator?.email || 'Unknown',
  completedBy: ticket.completer?.name || ticket.completer?.email || ticket.completed_by || '—',
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
  completedAt: ticket.completed_at,
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
      return response.data.tickets;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to load pending tickets';
      return [];
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
      return response.data.tickets;
    } catch (err) {
      error.value = err.response?.data?.message || 'Unable to load completed tickets';
      return [];
    } finally {
      loading.value = false;
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
    createTicket,
    updateTicket,
    markComplete,
    getTicketById,
    searchTickets,
    getGovernorateStats,
  };
});
