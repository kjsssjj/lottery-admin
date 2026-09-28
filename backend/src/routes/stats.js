import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
const router = Router();
router.use(requireAuth);
router.get('/overview', asyncHandler(async (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [totalActivities, activeActivities, totalInteractions, totalParticipations, totalPrizesWon, todayParticipations] = await Promise.all([
    prisma.activity.count(), prisma.activity.count({ where: { status: 'active' } }), prisma.interaction.count(),
    prisma.participation.count(), prisma.prizeRecord.count({ where: { prize: { type: { not: 'thanks' } } } }),
    prisma.participation.count({ where: { createdAt: { gte: todayStart } } }),
  ]);
  res.json({ code: 'OK', data: { totalActivities, activeActivities, totalInteractions, totalParticipations, totalPrizesWon, todayParticipations } });
}));
router.get('/trend', asyncHandler(async (req, res) => {
  const days = Math.min(30, Math.max(1, parseInt(req.query.days || '7', 10)));
  const now = new Date(); const points = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const nextDay = new Date(day.getTime() + 24 * 3600 * 1000);
    const count = await prisma.participation.count({ where: { createdAt: { gte: day, lt: nextDay } } });
    points.push({ date: day.toISOString().slice(0, 10), count });
  }
  res.json({ code: 'OK', data: points });
}));
router.get('/prize-distribution', asyncHandler(async (req, res) => {
  const activityId = parseInt(req.query.activityId || '0', 10) || undefined;
  const where = activityId ? { activityId } : {};
  const records = await prisma.prizeRecord.groupBy({ by: ['prizeId'], where, _count: { _all: true } });
  const prizeIds = records.map((r) => r.prizeId);
  const prizes = prizeIds.length ? await prisma.prize.findMany({ where: { id: { in: prizeIds } } }) : [];
  const map = new Map(prizes.map((p) => [p.id, p]));
  const data = records.map((r) => { const p = map.get(r.prizeId); return { prizeId: r.prizeId, name: p?.name || '(已删除)', type: p?.type || 'unknown', count: r._count._all }; });
  res.json({ code: 'OK', data });
}));
export default router;
