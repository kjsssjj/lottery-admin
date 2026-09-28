import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../utils/errors.js';
const router = Router();
router.use(requireAuth);
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const err = new AppError('参数错误', 400, 'VALIDATION_ERROR'); err.errors = errors.array(); return next(err); }
  next();
};
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.min(100, Math.max(1, parseInt(req.query.size || '20', 10)));
  const keyword = String(req.query.keyword || '').trim();
  const where = keyword ? { OR: [{ username: { contains: keyword } }, { nickname: { contains: keyword } }] } : {};
  const [total, items] = await Promise.all([prisma.user.count({ where }), prisma.user.findMany({ where, select: { id: true, username: true, nickname: true, role: true, status: true, createdAt: true }, orderBy: { id: 'desc' }, skip: (page - 1) * size, take: size })]);
  res.json({ code: 'OK', data: { total, page, size, items } });
}));
router.post('/', requireRole('admin'), body('username').isString().trim().isLength({ min: 2, max: 64 }), body('password').isString().isLength({ min: 6, max: 128 }), body('role').optional().isIn(['admin', 'operator', 'viewer']), body('nickname').optional().isString().isLength({ max: 64 }), validate, asyncHandler(async (req, res) => {
  const { username, password, role = 'operator', nickname = '' } = req.body;
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) throw new AppError('用户名已存在', 409, 'USERNAME_TAKEN');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, password: hashed, role, nickname }, select: { id: true, username: true, nickname: true, role: true, createdAt: true } });
  res.status(201).json({ code: 'OK', data: user });
}));
router.patch('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10); const patch = {};
  if (req.body.nickname !== undefined) patch.nickname = req.body.nickname;
  if (req.body.role !== undefined && ['admin', 'operator', 'viewer'].includes(req.body.role)) patch.role = req.body.role;
  if (req.body.status !== undefined && [0, 1].includes(req.body.status)) patch.status = req.body.status;
  if (req.body.password) patch.password = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.update({ where: { id }, data: patch });
  res.json({ code: 'OK', data: { id: user.id, username: user.username, role: user.role, status: user.status } });
}));
router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.user.id) throw new AppError('不能删除自己', 400, 'SELF_DELETE');
  await prisma.user.delete({ where: { id } });
  res.json({ code: 'OK', data: null });
}));
export default router;
