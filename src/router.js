import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import AppLayout from './components/AppLayout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/pending'
      },
      {
        path: 'create',
        name: 'CreateTicket',
        component: () => import('./views/CreateTicketPage.vue'),
        meta: { roles: ['user', 'super_admin'] }
      },
      {
        path: 'pending',
        name: 'PendingTickets',
        component: () => import('./views/PendingTicketsPage.vue')
      },
      {
        path: 'completed',
        name: 'CompletedTickets',
        component: () => import('./views/CompletedTicketsPage.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('./views/UsersPage.vue'),
        meta: { roles: ['super_admin'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pending'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && !from.name) {
    authStore.initializeAuth();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    return next('/login');
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return next('/pending');
  }

  const allowedRoles = to.matched.reduce((roles, record) => record.meta.roles || roles, null);
  if (allowedRoles && authStore.role && !allowedRoles.includes(authStore.role)) {
    return next('/pending');
  }

  return next();
});

export default router;
