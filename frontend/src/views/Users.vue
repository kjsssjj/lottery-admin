<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-toolbar">
        <el-input v-model="q.keyword" placeholder="搜索用户名/昵称" clearable @change="load" style="width:260px" />
        <el-button type="primary" @click="openDialog()">+ 新建用户</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" /><el-table-column prop="username" label="用户名" /><el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色" width="110"><template #default="{ row }"><el-tag>{{ roleLabel(row.role) }}</el-tag></template></el-table-column>
        <el-table-column label="状态" width="90"><template #default="{ row }"><el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="(v) => toggleStatus(row.id, v)" /></template></el-table-column>
        <el-table-column label="操作" width="180"><template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="remove(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template></el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新建用户'" width="480">
      <el-form :model="form" label-width="80">
        <el-form-item label="用户名"><el-input v-model="form.username" :disabled="!!editing" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" :placeholder="editing ? '留空则不修改' : '请输入密码'" /></el-form-item>
        <el-form-item label="角色"><el-select v-model="form.role" style="width:100%"><el-option label="管理员" value="admin" /><el-option label="操作员" value="operator" /><el-option label="只读" value="viewer" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { userApi } from '@/api/index.js';
import { ElMessage } from 'element-plus';
const loading = ref(false); const list = ref([]); const q = reactive({ keyword: '' });
const dialogVisible = ref(false); const editing = ref(null);
const form = reactive({ username: '', nickname: '', password: '', role: 'operator' });
function roleLabel(r) { return ({ admin: '管理员', operator: '操作员', viewer: '只读' })[r] || r; }
async function load() { loading.value = true; try { list.value = await userApi.list(q).then((r) => r.data.items); } finally { loading.value = false; } }
function openDialog(row = null) { editing.value = row; if (row) Object.assign(form, { username: row.username, nickname: row.nickname, role: row.role, password: '' }); else Object.assign(form, { username: '', nickname: '', password: '', role: 'operator' }); dialogVisible.value = true; }
async function submit() { if (editing.value) { const p = { nickname: form.nickname, role: form.role }; if (form.password) p.password = form.password; await userApi.update(editing.value.id, p); } else { await userApi.create(form); } ElMessage.success('保存成功'); dialogVisible.value = false; load(); }
async function remove(id) { await userApi.remove(id); ElMessage.success('已删除'); load(); }
async function toggleStatus(id, v) { await userApi.update(id, { status: v }); ElMessage.success('已更新'); }
onMounted(load);
</script>
