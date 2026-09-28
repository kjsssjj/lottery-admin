<template>
  <div class="page-container">
    <div class="stat-grid mb-16">
      <div class="stat-item"><div class="label">活动总数</div><div class="value">{{ overview.totalActivities }}</div></div>
      <div class="stat-item"><div class="label">进行中的活动</div><div class="value" style="color:#67c23a">{{ overview.activeActivities }}</div></div>
      <div class="stat-item"><div class="label">互动玩法数</div><div class="value">{{ overview.totalInteractions }}</div></div>
      <div class="stat-item"><div class="label">累计参与次数</div><div class="value" style="color:#409eff">{{ overview.totalParticipations }}</div></div>
      <div class="stat-item"><div class="label">累计中奖数</div><div class="value" style="color:#e6a23c">{{ overview.totalPrizesWon }}</div></div>
      <div class="stat-item"><div class="label">今日参与</div><div class="value" style="color:#f56c6c">{{ overview.todayParticipations }}</div></div>
    </div>
    <div class="page-card">
      <div class="page-toolbar"><h3 style="margin:0">过去 7 天参与趋势</h3>
        <el-radio-group v-model="days" size="small" @change="loadTrend"><el-radio-button :label="7">7 天</el-radio-button><el-radio-button :label="14">14 天</el-radio-button><el-radio-button :label="30">30 天</el-radio-button></el-radio-group>
      </div>
      <div class="chart">
        <div v-for="p in trend" :key="p.date" class="bar" :style="{ height: barHeight(p.count) + 'px' }">
          <div class="bar-value">{{ p.count }}</div><div class="bar-fill"></div><div class="bar-label">{{ p.date.slice(5) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { statsApi } from '@/api/index.js';
const overview = reactive({ totalActivities: 0, activeActivities: 0, totalInteractions: 0, totalParticipations: 0, totalPrizesWon: 0, todayParticipations: 0 });
const trend = ref([]); const days = ref(7);
async function loadOverview() { const res = await statsApi.overview(); Object.assign(overview, res.data); }
async function loadTrend() { const res = await statsApi.trend(days.value); trend.value = res.data; }
function barHeight(count) { const max = Math.max(...trend.value.map((t) => t.count), 1); return Math.max(4, (count / max) * 200); }
onMounted(() => { loadOverview(); loadTrend(); });
</script>
<style scoped>
.chart { display: flex; align-items: flex-end; gap: 12px; height: 260px; padding: 16px 0; }
.bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.bar-value { font-size: 12px; color: #606266; }
.bar-fill { width: 100%; max-width: 40px; background: linear-gradient(180deg, #409eff, #66b1ff); border-radius: 4px 4px 0 0; min-height: 4px; }
.bar-label { font-size: 12px; color: #909399; }
</style>
