// 种子数据：默认管理员 + 1 个示例活动 + 1 个大转盘互动 + 4 个奖品
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({ where: { username }, update: {}, create: { username, password: hashed, nickname: '超级管理员', role: 'admin' } });
  console.log('[seed] admin ready:', admin.username);
  const existing = await prisma.activity.findFirst();
  if (existing) { console.log('[seed] sample activity already exists, skip'); return; }
  const now = new Date();
  const activity = await prisma.activity.create({ data: { title: '示例抽奖活动', description: '这是一份示例活动，用于演示后台管理流程。可在上线前删除或编辑。', coverUrl: '', startTime: now, endTime: new Date(now.getTime() + 7 * 24 * 3600 * 1000), status: 'draft', creatorId: admin.id } });
  const interaction = await prisma.interaction.create({ data: { activityId: activity.id, type: 'wheel', name: '大转盘', config: JSON.stringify({ bgColor: '#ff4d4f', pointerColor: '#fff' }), dailyLimit: 3, totalLimit: 0 } });
  const prizes = [{ name: '一等奖 - iPhone', type: 'physical', value: 6999, stock: 1, probability: 0.01, sortOrder: 1 }, { name: '二等奖 - 100 元券', type: 'coupon', value: 100, stock: 10, probability: 0.05, sortOrder: 2 }, { name: '三等奖 - 50 积分', type: 'points', value: 50, stock: 100, probability: 0.2, sortOrder: 3 }, { name: '谢谢参与', type: 'thanks', value: 0, stock: -1, probability: 0.74, sortOrder: 4 }];
  for (const p of prizes) await prisma.prize.create({ data: { interactionId: interaction.id, ...p } });
  console.log('[seed] sample activity/interaction/prizes ready');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
