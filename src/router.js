import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'CreateTicket',
    component: () => import('./views/CreateTicketPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pending',
    name: 'PendingTickets',
    component: () => import('./views/PendingTicketsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/completed',
    name: 'CompletedTickets',
    component: () => import('./views/CompletedTicketsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth on first load
  if (!authStore.isAuthenticated && !from.name) {
    authStore.initializeAuth();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
