<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-toolbar">
        <div style="display:flex; gap:8px">
          <el-input v-model="q.keyword" placeholder="搜索标题" clearable @change="load" style="width:220px" />
          <el-select v-model="q.status" placeholder="状态" clearable @change="load" style="width:140px">
            <el-option label="草稿" value="draft" /><el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" /><el-option label="已结束" value="ended" />
          </el-select>
          <el-button @click="load">查询</el-button>
        </div>
        <el-button type="primary" @click="openDialog()">+ 新建活动</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="时间" min-width="260"><template #default="{ row }">{{ fmt(row.startTime) }} ~ {{ fmt(row.endTime) }}</template></el-table-column>
        <el-table-column label="状态" width="110"><template #default="{ row }"><el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag></template></el-table-column>
        <el-table-column label="统计" width="240"><template #default="{ row }">互动 {{ row._count.interactions }} / 参与 {{ row._count.participations }} / 中奖 {{ row._count.prizeRecords }}</template></el-table-column>
        <el-table-column label="操作" width="260" fixed="right"><template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row.id)">详情</el-button>
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="remove(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template></el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="q.page" v-model:page-size="q.size" :total="total" layout="total, sizes, prev, pager, next" :page-sizes="[10,20,50]" @size-change="load" @current-change="load" /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑活动' : '新建活动'" width="600">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="封面 URL"><el-input v-model="form.coverUrl" placeholder="https://..." /></el-form-item>
        <el-form-item label="有效期" prop="timeRange"><el-date-picker v-model="form.timeRange" type="datetimerange" start-placeholder="开始" end-placeholder="结束" style="width:100%" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option label="草稿" value="draft" /><el-option label="进行中" value="active" /><el-option label="已暂停" value="paused" /><el-option label="已结束" value="ended" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { activityApi } from '@/api/index.js';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
const router = useRouter(); const loading = ref(false); const list = ref([]); const total = ref(0);
const q = reactive({ page: 1, size: 20, keyword: '', status: '' });
const dialogVisible = ref(false); const editing = ref(null); const formRef = ref(null);
const form = reactive({ title: '', description: '', coverUrl: '', timeRange: null, status: 'draft' });
const formRules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], timeRange: [{ required: true, type: 'array', message: '请选择有效期', trigger: 'change' }] };
function fmt(v) { return v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'; }
function statusLabel(s) { return ({ draft: '草稿', active: '进行中', paused: '已暂停', ended: '已结束' })[s] || s; }
function statusType(s) { return ({ draft: 'info', active: 'success', paused: 'warning', ended: 'danger' })[s] || 'info'; }
async function load() { loading.value = true; try { const res = await activityApi.list(q); list.value = res.data.items; total.value = res.data.total; } finally { loading.value = false; } }
function openDialog(row = null) { editing.value = row; if (row) { form.title = row.title; form.description = row.description; form.coverUrl = row.coverUrl; form.status = row.status; form.timeRange = [row.startTime, row.endTime]; } else { form.title = ''; form.description = ''; form.coverUrl = ''; form.status = 'draft'; form.timeRange = null; } dialogVisible.value = true; }
async function submit() { try { await formRef.value.validate(); } catch { return; } const [startTime, endTime] = form.timeRange; const payload = { title: form.title, description: form.description, coverUrl: form.coverUrl, status: form.status, startTime, endTime }; if (editing.value) { await activityApi.update(editing.value.id, payload); ElMessage.success('已更新'); } else { await activityApi.create(payload); ElMessage.success('已创建'); } dialogVisible.value = false; load(); }
async function remove(id) { await activityApi.remove(id); ElMessage.success('已删除'); load(); }
function goDetail(id) { router.push({ name: 'ActivityDetail', params: { id } }); }
onMounted(load);
</script>
<style scoped>.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }</style>
