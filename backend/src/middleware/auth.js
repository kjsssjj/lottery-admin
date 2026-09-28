import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) return next(new AppError('未登录或登录已过期', 401, 'UNAUTHORIZED'));
  try { const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); req.user = payload; next(); }
  catch (e) { next(new AppError('登录已失效，请重新登录', 401, 'TOKEN_INVALID')); }
}
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new AppError('权限不足', 403, 'FORBIDDEN'));
    next();
  };
}
