import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router/index.js';
import { useUserStore } from '@/stores/user.js';
const http = axios.create({ baseURL: '/api', timeout: 15000, withCredentials: true });
http.interceptors.response.use((res) => res.data, (err) => {
  const status = err.response?.status; const code = err.response?.data?.code;
  const message = err.response?.data?.message || '请求失败';
  if (status === 401 || code === 'UNAUTHORIZED' || code === 'TOKEN_INVALID') { const user = useUserStore(); user.logout(); router.push({ name: 'Login' }); ElMessage.error('登录已过期，请重新登录'); }
  else ElMessage.error(message);
  return Promise.reject(err);
});
export default http;
export const authApi = { login: (data) => http.post('/auth/login', data), logout: () => http.post('/auth/logout'), me: () => http.get('/auth/me') };
export const userApi = { list: (q) => http.get('/users', { params: q }), create: (data) => http.post('/users', data), update: (id, data) => http.patch(`/users/${id}`, data), remove: (id) => http.delete(`/users/${id}`) };
export const activityApi = { list: (q) => http.get('/activities', { params: q }), get: (id) => http.get(`/activities/${id}`), create: (data) => http.post('/activities', data), update: (id, data) => http.patch(`/activities/${id}`, data), remove: (id) => http.delete(`/activities/${id}`) };
export const interactionApi = { list: (activityId) => http.get('/interactions', { params: { activityId } }), get: (id) => http.get(`/interactions/${id}`), create: (data) => http.post('/interactions', data), update: (id, data) => http.patch(`/interactions/${id}`, data), remove: (id) => http.delete(`/interactions/${id}`) };
export const prizeApi = { list: (interactionId) => http.get('/prizes', { params: { interactionId } }), create: (data) => http.post('/prizes', data), update: (id, data) => http.patch(`/prizes/${id}`, data), remove: (id) => http.delete(`/prizes/${id}`) };
export const participationApi = { list: (q) => http.get('/participations', { params: q }), draw: (data) => http.post('/participations/draw', data) };
export const statsApi = { overview: () => http.get('/stats/overview'), trend: (days) => http.get('/stats/trend', { params: { days } }), prizeDistribution: (activityId) => http.get('/stats/prize-distribution', { params: { activityId } }) };
