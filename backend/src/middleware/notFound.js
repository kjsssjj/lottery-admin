import { AppError } from '../utils/errors.js';
export function notFound(_req, _res, next) {
  next(new AppError('请求的资源不存在', 404, 'NOT_FOUND'));
}
