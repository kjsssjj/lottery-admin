import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../utils/errors.js';
const router = Router();
router.use(requireAuth);
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const err = new AppError('参数错误', 400, 'VALIDATION_ERROR'); err.errors = errors.array(); return next(err); }
  next();
};
function pickPrize(prizes) {
  const total = prizes.reduce((s, p) => s + p.probability, 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const p of prizes) { r -= p.probability; if (r <= 0) return p; }
  return prizes[prizes.length - 1];
}
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.min(100, Math.max(1, parseInt(req.query.size || '20', 10)));
  const activityId = parseInt(req.query.activityId || '0', 10) || undefined;
  const interactionId = parseInt(req.query.interactionId || '0', 10) || undefined;
  const externalId = req.query.externalId ? String(req.query.externalId) : undefined;
  const where = {};
  if (activityId) where.activityId = activityId;
  if (interactionId) where.interactionId = interactionId;
  if (externalId) where.externalId = externalId;
  const [total, items] = await Promise.all([prisma.participation.count({ where }), prisma.participation.findMany({ where, include: { interaction: { select: { id: true, name: true, type: true } }, activity: { select: { id: true, title: true } }, prizeRecords: { include: { prize: { select: { id: true, name: true, type: true } } } } }, orderBy: { id: 'desc' }, skip: (page - 1) * size, take: size })]);
  res.json({ code: 'OK', data: { total, page, size, items } });
}));
router.post('/draw', body('interactionId').isInt(), body('externalId').isString().trim().isLength({ min: 1, max: 128 }), validate, asyncHandler(async (req, res) => {
  const { interactionId, externalId, source = 'web' } = req.body;
  const interaction = await prisma.interaction.findUnique({ where: { id: interactionId }, include: { activity: true, prizes: { where: { status: 1 }, orderBy: { sortOrder: 'asc' } } } });
  if (!interaction) throw new AppError('互动不存在', 404, 'INTERACTION_NOT_FOUND');
  if (interaction.status !== 1) throw new AppError('互动未启用', 400, 'INTERACTION_DISABLED');
  const now = new Date();
  if (now < interaction.activity.startTime || now > interaction.activity.endTime) throw new AppError('活动不在有效期内', 400, 'ACTIVITY_NOT_IN_TIME');
  if (interaction.activity.status !== 'active') throw new AppError('活动未上线', 400, 'ACTIVITY_NOT_ACTIVE');
  const availablePrizes = interaction.prizes.filter((p) => p.stock !== 0);
  if (availablePrizes.length === 0) throw new AppError('奖品已发完', 400, 'NO_STOCK');
  const prize = pickPrize(availablePrizes);
  if (!prize) throw new AppError('没有可用奖品', 400, 'NO_PRIZE');
  const result = await prisma.$transaction(async (tx) => {
    const participation = await tx.participation.create({ data: { activityId: interaction.activityId, interactionId, userId: req.user.id, externalId, source } });
    let prizeRecord = null;
    if (prize.type !== 'thanks') {
      prizeRecord = await tx.prizeRecord.create({ data: { activityId: interaction.activityId, participationId: participation.id, prizeId: prize.id, status: 'pending' } });
      if (prize.stock > 0) await tx.prize.update({ where: { id: prize.id }, data: { stock: prize.stock - 1 } });
    }
    return { participation, prize, prizeRecord };
  });
  res.json({ code: 'OK', data: { won: result.prize.type !== 'thanks', prize: { id: result.prize.id, name: result.prize.name, type: result.prize.type, value: result.prize.value } } });
}));
export default router;
