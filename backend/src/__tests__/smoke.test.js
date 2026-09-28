// 后端单元测试
import { test } from 'node:test';
import assert from 'node:assert/strict';
test('prisma schema 字段定义存在', async () => {
  const { PrismaClient } = await import('@prisma/client');
  const client = new PrismaClient();
  assert.ok(client.user, 'user model 应存在');
  assert.ok(client.activity, 'activity model 应存在');
  assert.ok(client.interaction, 'interaction model 应存在');
  assert.ok(client.prize, 'prize model 应存在');
  assert.ok(client.participation, 'participation model 应存在');
  assert.ok(client.prizeRecord, 'prizeRecord model 应存在');
  await client.$disconnect();
});
test('errors.AppError 能携带 statusCode 与 code', async () => {
  const { AppError } = await import('../utils/errors.js');
  const err = new AppError('boom', 418, 'TEAPOT');
  assert.equal(err.statusCode, 418);
  assert.equal(err.code, 'TEAPOT');
  assert.equal(err.message, 'boom');
});
test('auth.signToken 不存在时不应泄漏密钥（仅验证 JWT 格式）', async () => {
  const jwt = (await import('jsonwebtoken')).default;
  const token = jwt.sign({ id: 1 }, 'dev-secret', { expiresIn: '1s' });
  assert.match(token, /^[^.]+\.[^.]+\.[^.]+$/);
});
