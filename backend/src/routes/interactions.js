import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../utils/errors.js';
const router = Router();
router.use(requireAuth);
const TYPES = ['wheel', 'scratch', 'grid', 'shake', 'quiz', 'flip', 'custom'];
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const err = new AppError('参数错误', 400, 'VALIDATION_ERROR'); err.errors = errors.array(); return next(err); }
  next();
};
function parseConfig(v) {
  if (v === undefined) return undefined;
  if (typeof v === 'string') { try { JSON.parse(v); return v; } catch { throw new AppError('config 必须是合法 JSON', 400, 'INVALID_JSON'); } }
  return JSON.stringify(v);
}
router.get('/', asyncHandler(async (req, res) => {
  const activityId = parseInt(req.query.activityId || '0', 10);
  if (!activityId) throw new AppError('缺少 activityId', 400, 'MISSING_ACTIVITY_ID');
  const items = await prisma.interaction.findMany({ where: { activityId }, include: { _count: { select: { prizes: true, participations: true } } }, orderBy: { id: 'desc' } });
  res.json({ code: 'OK', data: items });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = await prisma.interaction.findUnique({ where: { id }, include: { prizes: { orderBy: { sortOrder: 'asc' } } } });
  if (!item) throw new AppError('互动不存在', 404, 'NOT_FOUND');
  res.json({ code: 'OK', data: item });
}));
router.post('/', body('activityId').isInt(), body('name').isString().trim().isLength({ min: 1, max: 128 }), body('type').isIn(TYPES), validate, asyncHandler(async (req, res) => {
  const { activityId, name, type, config = {}, dailyLimit = 1, totalLimit = 0, status = 1 } = req.body;
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new AppError('活动不存在', 404, 'ACTIVITY_NOT_FOUND');
  const item = await prisma.interaction.create({ data: { activityId, name, type, config: parseConfig(config) || '{}', dailyLimit, totalLimit, status } });
  res.status(201).json({ code: 'OK', data: item });
}));
router.patch('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10); const patch = {};
  for (const k of ['name', 'type', 'dailyLimit', 'totalLimit', 'status']) { if (req.body[k] !== undefined) patch[k] = req.body[k]; }
  if (req.body.config !== undefined) patch.config = parseConfig(req.body.config);
  const item = await prisma.interaction.update({ where: { id }, data: patch });
  res.json({ code: 'OK', data: item });
}));
router.delete('/:id', asyncHandler(async (req, res) => { const id = parseInt(req.params.id, 10); await prisma.interaction.delete({ where: { id } }); res.json({ code: 'OK', data: null }); }));
export default router;
