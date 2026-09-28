import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { guest: true } },
  { path: '/', component: () => import('@/components/AppLayout.vue'), redirect: '/dashboard', meta: { requiresAuth: true }, children: [
    { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '数据看板' } },
    { path: 'activities', name: 'Activities', component: () => import('@/views/Activities.vue'), meta: { title: '活动管理' } },
    { path: 'activities/:id', name: 'ActivityDetail', component: () => import('@/views/ActivityDetail.vue'), meta: { title: '活动详情' } },
    { path: 'interactions/:id', name: 'Interactions', component: () => import('@/views/Interactions.vue'), meta: { title: '互动配置' } },
    { path: 'prizes/:interactionId', name: 'Prizes', component: () => import('@/views/Prizes.vue'), meta: { title: '奖品管理' } },
    { path: 'participations', name: 'Participations', component: () => import('@/views/Participations.vue'), meta: { title: '参与记录' } },
    { path: 'users', name: 'Users', component: () => import('@/views/Users.vue'), meta: { title: '用户管理', roles: ['admin'] } },
    { path: 'profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { title: '个人设置' } },
  ]},
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
];
const router = createRouter({ history: createWebHashHistory(), routes });
router.beforeEach((to, _from) => {
  const user = useUserStore();
  if (to.meta.requiresAuth && !user.token) return { name: 'Login' };
  if (to.meta.guest && user.token) return { name: 'Dashboard' };
  if (to.meta.roles && !to.meta.roles.includes(user.me?.role)) return { name: 'Dashboard' };
  return true;
});
export default router;
