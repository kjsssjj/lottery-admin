# lottery-admin

抽奖互动后台管理系统 (Vue3 + Express + Prisma + SQLite)

## 启动

```bash
npm install
cd backend && cp .env.example .env && npx prisma db push && node prisma/seed.js && cd ..
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3000
- 默认账号: admin / admin123

## 目录

- `backend/` Express + Prisma 后端
- `frontend/` Vue3 + ElementPlus 前端
- `scripts/` 目标站点采集脚本

详见完整 README 在仓库内。
