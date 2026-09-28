import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
function signToken(user) { return jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: EXPIRES_IN }); }
const validateLogin = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const err = new AppError('参数错误', 400, 'VALIDATION_ERROR'); err.errors = errors.array(); return next(err); }
  next();
};
router.post('/login', body('username').isString().trim().isLength({ min: 1, max: 64 }), body('password').isString().isLength({ min: 1, max: 128 }), validateLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new AppError('账号或密码错误', 401, 'AUTH_FAILED');
  if (user.status !== 1) throw new AppError('账号已被禁用', 403, 'USER_DISABLED');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError('账号或密码错误', 401, 'AUTH_FAILED');
  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ code: 'OK', data: { token, user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role } } });
}));
router.post('/logout', (_req, res) => { res.clearCookie('token'); res.json({ code: 'OK', data: null }); });
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, username: true, nickname: true, role: true, createdAt: true } });
  if (!user) throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
  res.json({ code: 'OK', data: user });
}));
export default router;
