<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" title="奖品管理" />
    <div class="page-card mt-16">
      <div class="page-toolbar"><div>概率总和：<b :style="{ color: totalProb > 1 ? '#f56c6c' : '#67c23a' }">{{ totalProb.toFixed(4) }}</b> / 1</div><el-button type="primary" @click="openDialog()">+ 新增奖品</el-button></div>
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="sortOrder" label="排序" width="70" /><el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column label="类型" width="110"><template #default="{ row }"><el-tag :type="typeTag(row.type)">{{ typeLabel(row.type) }}</el-tag></template></el-table-column>
        <el-table-column prop="value" label="面值" width="90" />
        <el-table-column label="库存" width="90"><template #default="{ row }">{{ row.stock < 0 ? '不限' : row.stock }}</template></el-table-column>
        <el-table-column prop="probability" label="概率" width="100"><template #default="{ row }">{{ (row.probability * 100).toFixed(2) }}%</template></el-table-column>
        <el-table-column label="已发" width="80"><template #default="{ row }">{{ row._count.prizeRecords }}</template></el-table-column>
        <el-table-column label="操作" width="180"><template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="remove(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template></el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑奖品' : '新增奖品'" width="520">
      <el-form :model="form" label-width="90">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.type" style="width:100%"><el-option label="实物" value="physical" /><el-option label="优惠券" value="coupon" /><el-option label="积分" value="points" /><el-option label="谢谢参与" value="thanks" /></el-select></el-form-item>
        <el-form-item label="面值"><el-input-number v-model="form.value" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="-1" /><div class="text-muted">-1 = 不限</div></el-form-item>
        <el-form-item label="概率"><el-slider v-model="form.probability" :min="0" :max="1" :step="0.01" show-input /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
        <el-form-item label="图片 URL"><el-input v-model="form.image" placeholder="https://..." /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { prizeApi } from '@/api/index.js';
import { ElMessage } from 'element-plus';
const route = useRoute(); const loading = ref(false); const list = ref([]);
const dialogVisible = ref(false); const editing = ref(null);
const form = reactive({ name: '', type: 'physical', value: 0, stock: 0, probability: 0.1, sortOrder: 0, image: '' });
const totalProb = computed(() => list.value.reduce((s, p) => s + p.probability, 0));
function typeLabel(t) { return ({ physical: '实物', coupon: '优惠券', points: '积分', thanks: '谢谢参与' })[t] || t; }
function typeTag(t) { return ({ physical: 'danger', coupon: 'warning', points: '', thanks: 'info' })[t] || ''; }
async function load() { loading.value = true; try { list.value = await prizeApi.list(route.params.interactionId).then((r) => r.data); } finally { loading.value = false; } }
function openDialog(row = null) { editing.value = row; if (row) { Object.assign(form, { name: row.name, type: row.type, value: row.value, stock: row.stock, probability: row.probability, sortOrder: row.sortOrder, image: row.image }); } else { Object.assign(form, { name: '', type: 'physical', value: 0, stock: 0, probability: 0.1, sortOrder: 0, image: '' }); } dialogVisible.value = true; }
async function submit() { const payload = { interactionId: Number(route.params.interactionId), ...form }; if (editing.value) await prizeApi.update(editing.value.id, payload); else await prizeApi.create(payload); ElMessage.success('保存成功'); dialogVisible.value = false; load(); }
async function remove(id) { await prizeApi.remove(id); ElMessage.success('已删除'); load(); }
onMounted(load);
</script>
