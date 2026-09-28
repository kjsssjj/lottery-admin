<template>
  <div class="page-container">
    <el-page-header @back="$router.push({ name: 'Activities' })" title="互动列表" />
    <div class="page-card mt-16">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" /><el-table-column prop="name" label="名称" /><el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="dailyLimit" label="每日次数" width="110" />
        <el-table-column label="奖品" width="80"><template #default="{ row }">{{ row._count.prizes }}</template></el-table-column>
        <el-table-column label="参与" width="80"><template #default="{ row }">{{ row._count.participations }}</template></el-table-column>
        <el-table-column label="操作"><template #default="{ row }"><el-button link type="primary" @click="$router.push({ name: 'Prizes', params: { interactionId: row.id } })">管理奖品</el-button></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { interactionApi } from '@/api/index.js';
const route = useRoute(); const loading = ref(false); const list = ref([]);
onMounted(async () => { loading.value = true; try { list.value = await interactionApi.list(route.params.id).then((r) => r.data); } finally { loading.value = false; } });
</script>
