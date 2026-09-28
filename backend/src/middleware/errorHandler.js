export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
  const message = err.message || '服务器内部错误';
  if (status >= 500) console.error('[ERROR]', err);
  else if (process.env.NODE_ENV !== 'test') console.warn(`[WARN] ${status} ${code}: ${message}`);
  const body = { code, message };
  if (err.errors) body.details = err.errors.map((e) => ({ field: e.path, message: e.msg }));
  res.status(status).json(body);
}
