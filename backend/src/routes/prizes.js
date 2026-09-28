import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../utils/errors.js';
const router = Router();
router.use(requireAuth);
const TYPES = ['physical', 'coupon', 'points', 'thanks'];
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const err = new AppError('参数错误', 400, 'VALIDATION_ERROR'); err.errors = errors.array(); return next(err); }
  next();
};
async function checkProbabilitySum(interactionId, newProb, excludeId = null) {
  const prizes = await prisma.prize.findMany({ where: { interactionId, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { probability: true } });
  const sum = prizes.reduce((s, p) => s + p.probability, 0) + newProb;
  if (sum > 1 + 1e-6) throw new AppError(`奖品概率总和 ${sum.toFixed(4)} 超过 1`, 400, 'PROBABILITY_OVERFLOW');
}
router.get('/', asyncHandler(async (req, res) => {
  const interactionId = parseInt(req.query.interactionId || '0', 10);
  if (!interactionId) throw new AppError('缺少 interactionId', 400, 'MISSING_INTERACTION_ID');
  const items = await prisma.prize.findMany({ where: { interactionId }, include: { _count: { select: { prizeRecords: true } } }, orderBy: { sortOrder: 'asc' } });
  res.json({ code: 'OK', data: items });
}));
router.post('/', body('interactionId').isInt(), body('name').isString().trim().isLength({ min: 1, max: 128 }), body('type').isIn(TYPES), body('probability').isFloat({ min: 0, max: 1 }), validate, asyncHandler(async (req, res) => {
  const { interactionId, name, image = '', type, value = 0, stock = 0, probability = 0, sortOrder = 0, status = 1 } = req.body;
  const interaction = await prisma.interaction.findUnique({ where: { id: interactionId } });
  if (!interaction) throw new AppError('互动不存在', 404, 'INTERACTION_NOT_FOUND');
  await checkProbabilitySum(interactionId, probability);
  const prize = await prisma.prize.create({ data: { interactionId, name, image, type, value, stock, probability, sortOrder, status } });
  res.status(201).json({ code: 'OK', data: prize });
}));
router.patch('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await prisma.prize.findUnique({ where: { id } });
  if (!existing) throw new AppError('奖品不存在', 404, 'NOT_FOUND');
  const patch = {};
  for (const k of ['name', 'image', 'type', 'value', 'stock', 'sortOrder', 'status']) { if (req.body[k] !== undefined) patch[k] = req.body[k]; }
  if (req.body.probability !== undefined) { await checkProbabilitySum(existing.interactionId, req.body.probability, id); patch.probability = req.body.probability; }
  const prize = await prisma.prize.update({ where: { id }, data: patch });
  res.json({ code: 'OK', data: prize });
}));
router.delete('/:id', asyncHandler(async (req, res) => { const id = parseInt(req.params.id, 10); await prisma.prize.delete({ where: { id } }); res.json({ code: 'OK', data: null }); }));
export default router;
