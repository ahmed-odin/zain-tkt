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
        component: () => import('./views/CreateTicketPage.vue')
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && !from.name) {
    authStore.initializeAuth();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/pending');
  } else {
    next();
  }
});

export default router;
