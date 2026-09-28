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
const STATUSES = ['draft', 'active', 'paused', 'ended'];
function parseDateTime(v) { if (!v) return null; const d = new Date(v); if (Number.isNaN(d.getTime())) return null; return d; }
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.min(100, Math.max(1, parseInt(req.query.size || '20', 10)));
  const keyword = String(req.query.keyword || '').trim();
  const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const where = {};
  if (keyword) where.title = { contains: keyword };
  if (status) where.status = status;
  const [total, items] = await Promise.all([prisma.activity.count({ where }), prisma.activity.findMany({ where, include: { _count: { select: { interactions: true, participations: true, prizeRecords: true } }, creator: { select: { id: true, username: true, nickname: true } } }, orderBy: { id: 'desc' }, skip: (page - 1) * size, take: size })]);
  res.json({ code: 'OK', data: { total, page, size, items } });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const activity = await prisma.activity.findUnique({ where: { id }, include: { interactions: { include: { _count: { select: { prizes: true, participations: true } } } }, _count: { select: { participations: true, prizeRecords: true } }, creator: { select: { id: true, username: true, nickname: true } } });
  if (!activity) throw new AppError('活动不存在', 404, 'NOT_FOUND');
  res.json({ code: 'OK', data: activity });
}));
router.post('/', body('title').isString().trim().isLength({ min: 1, max: 128 }), body('startTime').isISO8601(), body('endTime').isISO8601(), validate, asyncHandler(async (req, res) => {
  const { title, description = '', coverUrl = '', startTime, endTime, status = 'draft' } = req.body;
  if (!STATUSES.includes(status)) throw new AppError('非法 status', 400, 'INVALID_STATUS');
  const st = parseDateTime(startTime); const et = parseDateTime(endTime);
  if (!st || !et || et <= st) throw new AppError('结束时间必须晚于开始时间', 400, 'INVALID_TIME_RANGE');
  const activity = await prisma.activity.create({ data: { title, description, coverUrl, startTime: st, endTime: et, status, creatorId: req.user.id } });
  res.status(201).json({ code: 'OK', data: activity });
}));
router.patch('/:id', validate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10); const patch = {};
  for (const k of ['title', 'description', 'coverUrl']) { if (req.body[k] !== undefined) patch[k] = req.body[k]; }
  if (req.body.status !== undefined) { if (!STATUSES.includes(req.body.status)) throw new AppError('非法 status', 400, 'INVALID_STATUS'); patch.status = req.body.status; }
  if (req.body.startTime) patch.startTime = parseDateTime(req.body.startTime);
  if (req.body.endTime) patch.endTime = parseDateTime(req.body.endTime);
  const activity = await prisma.activity.update({ where: { id }, data: patch });
  res.json({ code: 'OK', data: activity });
}));
router.delete('/:id', asyncHandler(async (req, res) => { const id = parseInt(req.params.id, 10); await prisma.activity.delete({ where: { id } }); res.json({ code: 'OK', data: null }); }));
export default router;
