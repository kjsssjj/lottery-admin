<template>
  <div class="page-container">
    <div class="page-card">
      <h3>个人信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ user.me?.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user.me?.nickname }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ user.me?.role }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ fmt(user.me?.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from '@/stores/user.js';
import dayjs from 'dayjs';
const user = useUserStore();
function fmt(v) { return v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'; }
</script>
