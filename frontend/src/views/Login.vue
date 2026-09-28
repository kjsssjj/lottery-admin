<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="brand"><div class="brand-icon"></div><h1>抽奖互动后台</h1><p class="sub">登录后管理你的抽奖活动、互动玩法与奖品</p></div>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin" label-position="top">
        <el-form-item label="账号" prop="username"><el-input v-model="form.username" placeholder="请输入账号" size="large" prefix-icon="User" /></el-form-item>
        <el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" prefix-icon="Lock" /></el-form-item>
        <el-form-item><el-button type="primary" size="large" :loading="loading" native-type="submit" style="width:100%">登 录</el-button></el-form-item>
      </el-form>
      <div class="hint">默认管理员账号：<code>admin</code> / <code>admin123</code></div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import { ElMessage } from 'element-plus';
const router = useRouter(); const user = useUserStore(); const formRef = ref(null); const loading = ref(false);
const form = reactive({ username: '', password: '' });
const rules = { username: [{ required: true, message: '请输入账号', trigger: 'blur' }], password: [{ required: true, message: '请输入密码', trigger: 'blur' }] };
async function handleLogin() {
  try { await formRef.value.validate(); } catch { return; }
  loading.value = true;
  try { await user.login(form.username, form.password); ElMessage.success('登录成功'); router.push({ name: 'Dashboard' }); } catch (e) {}
  finally { loading.value = false; }
}
</script>
<style scoped>
.login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2); }
.login-card { width: 420px; background: #fff; padding: 40px 36px 24px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.brand { text-align: center; margin-bottom: 24px; }
.brand-icon { font-size: 48px; }
.brand h1 { margin: 8px 0 4px; font-size: 22px; color: #303133; }
.brand .sub { color: #909399; font-size: 13px; }
.hint { text-align: center; color: #909399; font-size: 12px; margin-top: 12px; }
.hint code { background: #f5f7fa; padding: 1px 6px; border-radius: 3px; color: #409eff; }
</style>
