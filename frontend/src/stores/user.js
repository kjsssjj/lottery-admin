import { defineStore } from 'pinia';
import { authApi } from '@/api/index.js';
export const useUserStore = defineStore('user', {
  state: () => ({ token: localStorage.getItem('token') || '', me: null }),
  actions: {
    async login(username, password) { const res = await authApi.login({ username, password }); this.token = res.data.token; this.me = res.data.user; localStorage.setItem('token', this.token); },
    async fetchMe() { if (!this.token) return; try { const res = await authApi.me(); this.me = res.data; } catch { this.logout(); } },
    logout() { this.token = ''; this.me = null; localStorage.removeItem('token'); authApi.logout().catch(() => {}); },
  },
});
