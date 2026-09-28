<template>
  <div class="page-container" v-loading="loading">
    <el-page-header @back="$router.push({ name: 'Activities' })" :title="'活动：' + (activity?.title || '')" />
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="16">
        <div class="page-card"><h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ activity?.id }}</el-descriptions-item>
            <el-descriptions-item label="状态"><el-tag>{{ statusLabel(activity?.status) }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ fmt(activity?.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ fmt(activity?.endTime) }}</el-descriptions-item>
            <el-descriptions-item label="创建人">{{ activity?.creator?.nickname || activity?.creator?.username }}</el-descriptions-item>
            <el-descriptions-item label="参与次数">{{ activity?._count?.participations }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ activity?.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="page-card mt-16">
          <div class="page-toolbar"><h3 style="margin:0">互动玩法</h3><el-button type="primary" size="small" @click="openDialog()">+ 新增互动</el-button></div>
          <el-table :data="activity?.interactions || []" stripe>
            <el-table-column prop="id" label="ID" width="70" /><el-table-column prop="name" label="名称" /><el-table-column prop="type" label="类型" width="100" />
            <el-table-column label="奖品/参与" width="140"><template #default="{ row }">{{ row._count.prizes }} / {{ row._count.participations }}</template></el-table-column>
            <el-table-column label="操作" width="220"><template #default="{ row }">
              <el-button link type="primary" @click="$router.push({ name: 'Prizes', params: { interactionId: row.id } })">管理奖品</el-button>
              <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
              <el-popconfirm title="确认删除？" @confirm="removeInteraction(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
            </template></el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="page-card"><h3>快捷操作</h3>
          <el-space direction="vertical" style="width:100%">
            <el-button style="width:100%" @click="testDraw" :loading="drawLoading">模拟一次抽奖（测试）</el-button>
            <el-alert v-if="drawResult" :title="drawResult.won ? '恭喜中奖！' : '谢谢参与'" :type="drawResult.won ? 'success' : 'info'" :closable="false"><template #default>奖品：{{ drawResult.prize.name }}（{{ drawResult.prize.type }}）</template></el-alert>
          </el-space>
        </div>
      </el-col>
    </el-row>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑互动' : '新增互动'" width="520">
      <el-form :model="form" label-width="100">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.type" style="width:100%"><el-option label="大转盘" value="wheel" /><el-option label="刮刮卡" value="scratch" /><el-option label="九宫格" value="grid" /><el-option label="摇一摇" value="shake" /><el-option label="答题" value="quiz" /><el-option label="翻牌" value="flip" /></el-select></el-form-item>
        <el-form-item label="每日次数"><el-input-number v-model="form.dailyLimit" :min="1" :max="99" /></el-form-item>
        <el-form-item label="总次数"><el-input-number v-model="form.totalLimit" :min="0" /><div class="text-muted">0=不限</div></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submitInteraction">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { activityApi, interactionApi, participationApi } from '@/api/index.js';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
const route = useRoute(); const loading = ref(false); const activity = ref(null);
const dialogVisible = ref(false); const editing = ref(null);
const form = reactive({ name: '', type: 'wheel', dailyLimit: 3, totalLimit: 0 });
const drawLoading = ref(false); const drawResult = ref(null);
function fmt(v) { return v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'; }
function statusLabel(s) { return ({ draft: '草稿', active: '进行中', paused: '已暂停', ended: '已结束' })[s] || s || '-'; }
async function load() { loading.value = true; try { activity.value = await activityApi.get(route.params.id).then((r) => r.data); } finally { loading.value = false; } }
function openDialog(row = null) { editing.value = row; if (row) { form.name = row.name; form.type = row.type; form.dailyLimit = row.dailyLimit; form.totalLimit = row.totalLimit; } else { form.name = ''; form.type = 'wheel'; form.dailyLimit = 3; form.totalLimit = 0; } dialogVisible.value = true; }
async function submitInteraction() { const payload = { activityId: Number(route.params.id), ...form }; if (editing.value) await interactionApi.update(editing.value.id, payload); else await interactionApi.create(payload); ElMessage.success('保存成功'); dialogVisible.value = false; load(); }
async function removeInteraction(id) { await interactionApi.remove(id); ElMessage.success('已删除'); load(); }
async function testDraw() { const inter = activity.value?.interactions?.[0]; if (!inter) return ElMessage.warning('请先创建一个互动玩法'); drawLoading.value = true; try { const res = await participationApi.draw({ interactionId: inter.id, externalId: 'test-user-' + Date.now() }); drawResult.value = res.data; } finally { drawLoading.value = false; } }
onMounted(load);
</script>
