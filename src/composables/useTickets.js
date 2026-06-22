import { useTicketStore } from '../stores/ticketStore';

export function useTickets() {
  const ticketStore = useTicketStore();

  const createTicket = (ticketData, creator) => {
    return ticketStore.addTicket(ticketData, creator);
  };

  const updateTicket = (id, updates, currentUser) => {
    return ticketStore.updateTicket(id, updates, currentUser);
  };

  const deleteTicket = (id) => {
    return ticketStore.deleteTicket(id);
  };

  const getTicket = (id) => {
    return ticketStore.getTicketById(id);
  };

  const getAllTickets = () => {
    return ticketStore.allTickets;
  };

  const searchAndFilter = (query = '', filters = {}) => {
    return ticketStore.searchTickets(query, filters);
  };

  const getStats = () => {
    return ticketStore.getTicketStats();
  };

  const getGovernorateStats = () => {
    return ticketStore.getGovernorateStats();
  };

  return {
    createTicket,
    updateTicket,
    deleteTicket,
    getTicket,
    getAllTickets,
    searchAndFilter,
    getStats,
    getGovernorateStats
  };
}
