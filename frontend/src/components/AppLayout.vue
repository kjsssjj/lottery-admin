<template>
  <el-container class="app-layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="app-aside">
      <div class="logo"><span class="logo-icon"></span><span v-show="!collapsed" class="logo-text">抽奖后台</span></div>
      <el-menu :default-active="activeMenu" :collapse="collapsed" router background-color="#001529" text-color="#ffffffb3" active-text-color="#409eff">
        <el-menu-item index="/dashboard"><el-icon><Odometer /></el-icon><template #title>数据看板</template></el-menu-item>
        <el-menu-item index="/activities"><el-icon><Tickets /></el-icon><template #title>活动管理</template></el-menu-item>
        <el-menu-item index="/participations"><el-icon><Document /></el-icon><template #title>参与记录</template></el-menu-item>
        <el-menu-item v-if="user.me?.role === 'admin'" index="/users"><el-icon><User /></el-icon><template #title>用户管理</template></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed"><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
          <el-breadcrumb separator="/"><el-breadcrumb-item>后台</el-breadcrumb-item><el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item></el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="onCommand">
            <span class="user-chip"><el-avatar :size="28">{{ (user.me?.nickname || user.me?.username || 'A').slice(0, 1) }}</el-avatar><span class="user-name">{{ user.me?.nickname || user.me?.username }}</span><el-icon><ArrowDown /></el-icon></span>
            <template #dropdown><el-dropdown-menu><el-dropdown-item command="profile">个人设置</el-dropdown-item><el-dropdown-item command="logout" divided>退出登录</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="app-main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Odometer, Tickets, Document, User, Fold, Expand, ArrowDown } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user.js';
const route = useRoute(); const router = useRouter(); const user = useUserStore(); const collapsed = ref(false);
onMounted(() => { user.fetchMe(); });
const activeMenu = computed(() => '/' + route.path.split('/')[1]);
const currentTitle = computed(() => route.meta?.title || '');
function onCommand(cmd) { if (cmd === 'logout') { user.logout(); router.push({ name: 'Login' }); } else if (cmd === 'profile') { router.push({ name: 'Profile' }); } }
</script>
<style scoped>
.app-layout { height: 100vh; }
.app-aside { background: #001529; transition: width 0.2s; overflow: hidden; }
.logo { height: 60px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #fff; font-size: 16px; font-weight: 600; border-bottom: 1px solid #ffffff1a; }
.logo-icon { font-size: 22px; }
.app-header { background: #fff; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 16px; }
.collapse-btn { font-size: 18px; cursor: pointer; color: #606266; }
.header-right { display: flex; align-items: center; }
.user-chip { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #303133; }
.user-name { font-size: 14px; }
.app-main { background: #f5f7fa; padding: 0; }
</style>
