import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCurrentDateTime } from '../utils/dateFormatter';

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref([]);
  const currentEditingTicket = ref(null);

  // Initialize tickets from localStorage
  const initializeTickets = () => {
    const stored = localStorage.getItem('tickets');
    if (stored) {
      try {
        tickets.value = JSON.parse(stored);
      } catch {
        tickets.value = [];
      }
    }
  };

  // Save tickets to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('tickets', JSON.stringify(tickets.value));
    // Update next ticket ID
    const maxId = tickets.value.length > 0 
      ? Math.max(...tickets.value.map(t => t.id))
      : 0;
    localStorage.setItem('nextTicketId', JSON.stringify(maxId + 1));
  };

  // Get next ticket ID
  const getNextId = () => {
    let nextId = 1;
    if (tickets.value.length > 0) {
      nextId = Math.max(...tickets.value.map(t => t.id)) + 1;
    }
    return nextId;
  };

  // Add a new ticket
  const addTicket = (ticketData, creator) => {
    const newTicket = {
      id: getNextId(),
      missdn: ticketData.missdn,
      problemDescription: ticketData.problemDescription || '',
      governorate: ticketData.governorate,
      comments: ticketData.comments,
      status: ticketData.status || 'Pending',
      createdBy: creator,
      completedBy: null,
      createdAt: getCurrentDateTime(),
      updatedAt: getCurrentDateTime()
    };
    
    tickets.value.push(newTicket);
    saveToLocalStorage();
    return newTicket;
  };

  // Update an existing ticket
  const updateTicket = (id, updates, currentUser) => {
    const ticket = tickets.value.find(t => t.id === id);
    if (!ticket) return null;

    // Update fields
    if (updates.missdn !== undefined) ticket.missdn = updates.missdn;
    if (updates.problemDescription !== undefined) ticket.problemDescription = updates.problemDescription;
    if (updates.governorate !== undefined) ticket.governorate = updates.governorate;
    if (updates.comments !== undefined) ticket.comments = updates.comments;
    
    // If status is being changed to Complete, set completedBy
    if (updates.status === 'Complete' && ticket.status !== 'Complete') {
      ticket.completedBy = currentUser;
    }
    // If status changes away from Complete, clear completedBy
    if (updates.status !== 'Complete' && ticket.status === 'Complete') {
      ticket.completedBy = null;
    }
    
    if (updates.status !== undefined) ticket.status = updates.status;
    ticket.updatedAt = getCurrentDateTime();

    saveToLocalStorage();
    return ticket;
  };

  // Delete a ticket
  const deleteTicket = (id) => {
    const index = tickets.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tickets.value.splice(index, 1);
      saveToLocalStorage();
      return true;
    }
    return false;
  };

  // Get ticket by ID
  const getTicketById = (id) => {
    return tickets.value.find(t => t.id === id);
  };

  // Search and filter tickets
  const searchTickets = (query = '', filters = {}) => {
    let results = [...tickets.value];

    // Search by MISSDN (case-insensitive)
    if (query && query.trim()) {
      const searchLower = query.toLowerCase();
      results = results.filter(t => 
        t.missdn.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      results = results.filter(t => t.status === filters.status);
    }

    // Filter by governorate
    if (filters.governorate && filters.governorate !== 'all') {
      results = results.filter(t => t.governorate === filters.governorate);
    }

    return results;
  };

  // Get ticket statistics
  const getTicketStats = () => {
    return {
      total: tickets.value.length,
      pending: tickets.value.filter(t => t.status === 'Pending').length,
      inProgress: tickets.value.filter(t => t.status === 'In Progress').length,
      complete: tickets.value.filter(t => t.status === 'Complete').length
    };
  };

  // Get governorate counts
  const getGovernorateStats = () => {
    const stats = {};
    tickets.value.forEach(t => {
      stats[t.governorate] = (stats[t.governorate] || 0) + 1;
    });
    return stats;
  };

  // Computed getters
  const allTickets = computed(() => tickets.value);
  const filteredTickets = computed(() => (query = '', filters = {}) => {
    return searchTickets(query, filters);
  });
  const ticketStats = computed(() => getTicketStats());

  return {
    tickets,
    currentEditingTicket,
    allTickets,
    filteredTickets,
    ticketStats,
    initializeTickets,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    searchTickets,
    getTicketStats,
    getGovernorateStats,
    getNextId
  };
});
