<script setup lang="ts">
import StatisticCard from '../components/common/StatisticCard.vue'
import { onMounted, ref } from 'vue'
import { CNY } from '../../electron/common/currencyUtil'

const totalData = ref()
onMounted(() => {
  window.database.getListPageSum().then((resp) => {
    totalData.value = resp
  })
})
</script>

<template>
  <div v-if="totalData" class="grid grid-cols-4 gap-2 p-4 mt-2">
    <StatisticCard title="总计营收" color="error" :value="CNY(totalData.totalRevenue).format()" />
    <StatisticCard title="今日营收" color="warning" :value="CNY(totalData.todayRevenue).format()" />
    <StatisticCard
      title="微信收款"
      color="success"
      icon="mdi-wechat"
      :value="CNY(totalData.todayWeChat).add(totalData.todayWeChatScan).format()"
    />
    <StatisticCard
      title="支付宝收款"
      color="info"
      icon="mdi-alpha-a-circle"
      :value="CNY(totalData.todayAlipay).add(totalData.todayAlipayScan).format()"
    />
  </div>
</template>

<style scoped></style>
