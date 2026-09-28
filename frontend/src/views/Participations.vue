<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-toolbar"><div style="display:flex; gap:8px">
        <el-input v-model="q.externalId" placeholder="C 端用户 ID" clearable @change="load" style="width:220px" />
        <el-button @click="load">查询</el-button>
      </div></div>
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="活动" width="160"><template #default="{ row }">{{ row.activity?.title }}</template></el-table-column>
        <el-table-column label="互动" width="140"><template #default="{ row }">{{ row.interaction?.name }} ({{ row.interaction?.type }})</template></el-table-column>
        <el-table-column prop="externalId" label="C 端用户" width="160" />
        <el-table-column prop="source" label="来源" width="90" />
        <el-table-column label="中奖" min-width="220"><template #default="{ row }">
          <template v-if="row.prizeRecords?.length"><el-tag v-for="r in row.prizeRecords" :key="r.id" :type="r.prize?.type === 'physical' ? 'danger' : 'success'" style="margin-right:4px">{{ r.prize?.name }}</el-tag></template>
          <span v-else class="text-muted">未中奖</span>
        </template></el-table-column>
        <el-table-column label="时间" width="170"><template #default="{ row }">{{ fmt(row.createdAt) }}</template></el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="q.page" v-model:page-size="q.size" :total="total" layout="total, prev, pager, next" @current-change="load" /></div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { participationApi } from '@/api/index.js';
import dayjs from 'dayjs';
const loading = ref(false); const list = ref([]); const total = ref(0);
const q = reactive({ page: 1, size: 20, externalId: '' });
function fmt(v) { return v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'; }
async function load() { loading.value = true; try { const res = await participationApi.list(q); list.value = res.data.items; total.value = res.data.total; } finally { loading.value = false; } }
onMounted(load);
</script>
<style scoped>.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }</style>
