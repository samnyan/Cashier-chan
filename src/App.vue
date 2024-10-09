<script setup lang="ts">
import PosPage from './views/PosPage.vue'
import { appTemp } from './store/appTemp'
import { onMounted } from 'vue'
import Toast from './components/common/Toast.vue'
import AppHeader from './components/AppHeader.vue'
import TradePage from './views/TradePage.vue'
import IndexGroupPage from './views/IndexGroupPage.vue'
import ProductPage from './views/ProductPage.vue'
import { ErrorBody, setResponseInterceptor } from '../electron/common/request'
import { AxiosError } from 'axios'
import { showToastError } from './store/toast'
import StatisticPage from './views/StatisticPage.vue'

onMounted(() => {
  setResponseInterceptor((error: AxiosError<ErrorBody>) => {
    if (error.code == 'ERR_NETWORK') {
      showToastError('网络连接错误！请检查网络连接并重试！')
    } else {
      showToastError(error.message)
    }
  })
})
</script>

<template>
  <v-app id="pos">
    <Toast />
    <AppHeader />
    <v-main class="w-full h-full">
      <PosPage v-if="appTemp.tab == 'home'" />
      <ProductPage v-if="appTemp.tab == 'product'" />
      <TradePage v-if="appTemp.tab == 'trade'" />
      <IndexGroupPage v-if="appTemp.tab == 'indexGroup'" />
      <StatisticPage v-if="appTemp.tab == 'statistic'" />
    </v-main>
  </v-app>
</template>

<style></style>
